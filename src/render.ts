import * as webfont from '@compositor/webfont'
import * as dot from 'dot-prop'
import * as glamor from 'glamor/server'
import * as glamorous from 'glamorous'
import * as React from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import * as SC from 'styled-components'

import { createComponents } from './createComponents'
import createHTML from './createHTML'
import { toComponent } from './jsx'
import Markdown from './Markdown'
import primitives from './primitives'

import { BasicComponentProps, Content, CreateHtmlData, FirstPage, Options, Options2, RenderPage, ScopedComponents } from './types'

const h = React.createElement

const themeProviders = {
  'styled-components': SC.ThemeProvider,
  glamorous: glamorous.ThemeProvider,
}

const cssCreators = {
  'styled-components': (Component: React.ComponentClass, props: BasicComponentProps) => {
    const sheet = new SC.ServerStyleSheet()
    renderToStaticMarkup(sheet.collectStyles(h(Component, props)))
    const tags = sheet.getStyleTags()
    return tags
  },
  glamorous: (Component: React.ComponentClass, props: BasicComponentProps) => {
    const { css } = glamor.renderStatic(() => renderToString(h(Component, props)))
    const tag = `<style>${css}</style>`
    return tag
  },
}

const getLayout = (pages: FirstPage[] = [], data: CreateHtmlData, scope: ScopedComponents) => {
  if (!data.layout) {
    return scope.DefaultLayout
  }
  const layout: FirstPage | undefined = pages.find(page => page.name === data.layout)

  if (!layout || layout.ext !== '.jsx') {
    return scope.DefaultLayout
  }

  const { content } = layout
  try {
    const Comp = toComponent(content, scope)
    Comp.defaultProps = data
    return Comp
  } catch (err) {
    console.log(err)
    return scope.DefaultLayout
  }
}

// theme,
const renderPage = (scope: ScopedComponents, opts: Options2) => (page: FirstPage): RenderPage => {
  const library = opts.library
  const Provider = (library && themeProviders[library]) || themeProviders['styled-components']
  const getCSS = (library && cssCreators[library]) || cssCreators['styled-components']

  const Layout = page.ext === '.md' ? getLayout(opts.pages, page.data, scope) : React.Fragment
  const pageScope = {
    ...scope,
    Layout,
    Markdown,
    Provider,
    scope,
    page,
    library,
    options: opts,
  }

  const content =
    page.ext === '.jsx'
      ? page.content
      : `<Markdown
        text={page.content}
        scope={scope}
        library='${library}'
        options={options}
      />`

  const Page = toComponent(
    `<Provider theme={theme}>
      <Font>
        <Layout>
          ${content}
        </Layout>
      </Font>
    </Provider>`,
    pageScope,
  )

  try {
    const el = h(Page, page.data)
    const body = renderToStaticMarkup(el)
    // const html = renderToString(el)
    // todo: css
    const css = getCSS(Page, page.data) // full style tag
    const fontLinks = dot
      .get(scope, 'theme.fonts', [])
      .map((font: string) => webfont.getLinkTag(font, []))
      .filter((tag: string | false) => !!tag)
      .join('')
    const html = createHTML({ body, css, fontLinks, data: page.data })
    return {
      ...page,
      html,
    }
  } catch (err) {
    console.log(err)
    return {
      ...page,
      html: err.toString(),
    }
  }
}

const render = async ({ dirname, theme = {}, lab = {}, pages = [] }: Content, opts: Options): Promise<RenderPage[]> => {
  const library = lab.library || 'styled-components'
  const opts2: Options2 = {
    dirname,
    library,
    pages,
    ...opts,
  }

  const base = createComponents(primitives, opts2)
  const components = createComponents(lab.components || [], opts2)
  const scope: ScopedComponents = {
    ...base,
    ...components,
    theme,
  }
  const rendered = pages.map(renderPage(scope, opts2))

  return rendered
}

export { render }
