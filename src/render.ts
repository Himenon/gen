import * as dot from 'dot-prop'
// @ts-ignore
import * as glamor from 'glamor/server'
import * as glamorous from 'glamorous'
import * as React from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import * as SC from 'styled-components'
const webfont = require('@compositor/webfont')

import { createComponents } from './createComponents'
import createHTML from './createHTML'
import { toComponent } from './jsx'
import Markdown from './Markdown'
import primitives from './primitives'

const h = React.createElement

const themeProviders = {
  'styled-components': SC.ThemeProvider,
  glamorous: glamorous.ThemeProvider,
}

// themeProviders.default = themeProviders['styled-components']

const cssCreators = {
  'styled-components': (Component: any, props: any) => {
    const sheet = new SC.ServerStyleSheet()
    renderToStaticMarkup(sheet.collectStyles(h(Component, props)))
    const tags = sheet.getStyleTags()
    return tags
  },
  glamorous: (Component: any, props: any) => {
    const { css } = glamor.renderStatic(() => renderToString(React.createElement(Component, props)))
    const tag = `<style>${css}</style>`
    return tag
  },
}

// alias
// cssCreators.default = cssCreators['styled-components']
// cssCreators.glamor = cssCreators.glamorous

interface ILayout {
  content: any
  ext: string
}

const getLayout = (pages: any[] = [], data: any, scope: any) => {
  if (!data.layout) {
    return scope.DefaultLayout
  }
  const layout: ILayout | undefined = pages.find((page: { name: any }) => page.name === data.layout)

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

const renderPage = (scope: any, opts: any) => (page: any) => {
  const library = opts.library
  // @ts-ignore
  const Provider = themeProviders[library] || themeProviders.default
  // @ts-ignore
  const getCSS = cssCreators[library] || cssCreators.default

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
      .map((font: string) => webfont.getLinkTag(font))
      // @ts-ignore
      .filter(tag => !!tag)
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

export interface RenderArguments {
  dirname?: string
  theme: any
  lab: any
  pages: any[]
}

const render = async ({ dirname, theme = {}, lab = {}, pages = [] }: RenderArguments, _opts: any) => {
  const library = lab.library || 'styled-components'
  const opts = {
    dirname,
    library,
    pages,
    ..._opts,
  }

  const base = createComponents(primitives, opts)
  const components = createComponents(lab.components || [], opts)
  const scope = {
    ...base,
    ...components,
    theme,
  }
  const rendered = pages.map(renderPage(scope, opts))

  return rendered
}

export { render }
