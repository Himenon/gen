import * as React from 'react'
const remark = require('remark')
const remarkSlug = require('remark-slug')
const remarkReact = require('remark-react')

import { markdownComponents } from './markdownComponents'

const heading = (Comp: any) => (props: any) => {
  return React.createElement(
    Comp,
    props,
    React.createElement(
      'a',
      {
        href: '#' + props.id,
        style: {
          color: 'inherit',
          textDecoration: 'none',
        },
      },
      props.children,
    ),
  )
}

const relativize = (href: string) => (/\.md$/.test(href) ? href.replace(/\.md$/, '/') : href)

const link = (Comp: any) => (props: any) =>
  React.createElement(
    Comp,
    Object.assign({}, props, {
      href: relativize(props.href),
    }),
  )

export interface MarkdownProps {
  h1: { [key in string]: number }
  h2: { [key in string]: number }
  h3: { [key in string]: number }
  p: { [key in string]: number }
  options?: { [key in string]: number }
  text?: string
  scope: any
  library: any
}

const defaultProps = {
  h1: {
    mt: 4,
    mb: 3,
  },
  h2: {
    mt: 4,
    mb: 3,
  },
  h3: {
    mt: 4,
    mb: 3,
  },
  p: {
    mt: 0,
    mb: 3,
  },
}

class Markdown extends React.Component<MarkdownProps, {}> {
  private mapScope = (scope: any) => {
    const comps = {
      h1: heading(scope.Title || scope.Heading || scope.H1),
      h2: heading(scope.Heading || scope.H2),
      h3: heading(scope.Subhead || scope.H3),
      p: scope.Text,
      a: link(scope.Link),
      hr: scope.Divider,
      blockquote: scope.Blockquote,
      pre: scope.Pre,
      code: scope.Code,
      table: scope.Table,
    }

    return comps
  }

  private applyProps = (scope: any) => {
    const { options = {} } = this.props
    const props = Object.assign({}, defaultProps, options.markdownProps)
    Object.keys(props).forEach(key => {
      if (!scope[key]) return
      scope[key].defaultProps = Object.assign({}, scope[key].defaultProps, props[key])
    })
    return scope
  }

  render() {
    const { text = '', scope, library } = this.props
    const defaultScope = markdownComponents({ library })

    const mappedScope = this.mapScope(Object.assign({}, defaultScope, scope))
    const remarkReactComponents = this.applyProps(mappedScope)

    const opts = {
      // pass Lab components to remark-react for rendering
      remarkReactComponents,
    }
    const element = remark()
      .use(remarkSlug)
      .use(remarkReact, opts)
      .processSync(text).contents

    return element
  }
}

export default Markdown
