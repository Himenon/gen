import * as React from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import * as SC from 'styled-components'
import * as glamorous from 'glamorous'
import * as glamor from 'glamor/server'
import * as dot from 'dot-prop'
import * as webfont from '@compositor/webfont'

import * as createComponents from './createComponents'
import { toComponent } from './jsx'
import primitives from './primitives'
import createHTML from './createHTML'
import Markdown from './Markdown'

const h = React.createElement

const themeProviders = {
  'styled-components': SC.ThemeProvider,
  glamorous: glamorous.ThemeProvider,
}

themeProviders.default = themeProviders['styled-components']

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
cssCreators.default = cssCreators['styled-components']
cssCreators.glamor = cssCreators.glamorous

const getLayout = (pages = [], data, scope) => {
  if (!data.layout) return scope.DefaultLayout
  const layout = pages.find(page => page.name === data.layout)

  if (!layout || layout.ext !== '.jsx') return scope.DefaultLayout

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
  const Provider = themeProviders[library] || themeProviders.default
  const getCSS = cssCreators[library] || cssCreators.default

  const Layout = page.ext === '.md' ? getLayout(opts.pages, page.data, scope) : React.Fragment
  const pageScope = Object.assign({}, scope, {
    Layout,
    Markdown,
    Provider,
    scope,
    page,
    library,
    options: opts,
  })

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
      .map(font => webfont.getLinkTag(font))
      .filter(tag => !!tag)
      .join('')
    const html = createHTML({ body, css, fontLinks, data: page.data })
    return Object.assign({}, page, {
      html,
    })
  } catch (err) {
    console.log(err)
    return Object.assign({}, page, {
      html: err.toString(),
    })
  }
}

const render = async ({ dirname, theme = {}, lab = {}, pages = [] }, _opts) => {
  const library = lab.library || 'styled-components'
  const opts = Object.assign(
    {
      dirname,
      library,
      pages,
    },
    _opts,
  )

  const base = createComponents(primitives, opts)
  const components = createComponents(lab.components || [], opts)
  const scope = Object.assign({}, base, components, {
    theme,
  })
  const rendered = pages.map(renderPage(scope, opts))

  return rendered
}

export { render }
