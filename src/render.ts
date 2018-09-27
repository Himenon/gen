import * as webfont from '@compositor/webfont'
import * as dot from 'dot-prop'
import * as glamor from 'glamor/server'
import * as glamorous from 'glamorous'
import * as React from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import * as SC from 'styled-components'

import { createComponents } from './createComponents'
import { createHTML } from './createHTML'
import { toComponent } from './jsx'
import Markdown from './Markdown'
import primitives from './primitives'

import { Content, HtmlMetaData, LocalOptions, Options, PageData, ScopedComponents } from '@gen'

export type BasicComponentProps = HtmlMetaData & React.Attributes

export interface RenderPage extends PageData {
  html: string
}

const h = React.createElement

const themeProviders = {
  'styled-components': SC.ThemeProvider,
  glamorous: glamorous.ThemeProvider,
}

type CssCreator = (Component: React.ComponentClass, props: BasicComponentProps) => string

const cssCreators: { [key: string]: CssCreator } = {
  'styled-components': (Component, props) => {
    const sheet = new SC.ServerStyleSheet()
    renderToStaticMarkup(sheet.collectStyles(h(Component, props)))
    const tags = sheet.getStyleTags()
    return tags
  },
  glamorous: (Component, props) => {
    const { css } = glamor.renderStatic(() => renderToString(h(Component, props)))
    const tag = `<style>${css}</style>`
    return tag
  },
}

const getLayout = (pages: PageData[] = [], data: HtmlMetaData, scope: ScopedComponents) => {
  if (!data.layout) {
    return scope.DefaultLayout
  }
  const pageData: PageData | undefined = pages.find(page => page.name === data.layout)

  if (!pageData || pageData.ext !== '.jsx') {
    return scope.DefaultLayout
  }

  const { content } = pageData
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
const renderPage = (scope: ScopedComponents, opts: LocalOptions) => (page: PageData): RenderPage => {
  const library = opts.library
  const Provider = (library && themeProviders[library]) || themeProviders['styled-components']
  const getCSS: CssCreator = (library && cssCreators[library]) || cssCreators['styled-components']

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

  const pageComponent = toComponent(
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
    const el = h(pageComponent, page.data)
    const body = renderToStaticMarkup(el)
    // const html = renderToString(el)
    // todo: css
    const css = getCSS(pageComponent, page.data) // full style tag
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
  const localOpts: LocalOptions = {
    dirname,
    library,
    pages,
    ...opts,
  }

  const base = createComponents(primitives, localOpts)
  const components = createComponents(lab.components || [], localOpts)
  const scope: ScopedComponents = {
    ...base,
    ...components,
    theme,
  }
  const rendered = pages.map(renderPage(scope, localOpts))

  return rendered
}

export { render }
