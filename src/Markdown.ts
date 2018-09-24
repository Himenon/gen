import * as React from 'react'
// @ts-ignore
import * as remark from 'remark'
// @ts-ignore
import * as remarkReact from 'remark-react'
// @ts-ignore
import * as remarkSlug from 'remark-slug'

import { markdownComponents } from './markdownComponents'
import { MarkdownProps } from './types'

const heading = (Comp: keyof React.ReactHTML) => (props: any) => {
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

const link = (Comp: keyof React.ReactHTML) => (props: any) =>
  React.createElement(Comp, {
    ...props,
    href: relativize(props.href),
  })

const defaultProps: MarkdownProps = {
  h1: {
    mb: 3,
    mt: 4,
  },
  h2: {
    mb: 3,
    mt: 4,
  },
  h3: {
    mb: 3,
    mt: 4,
  },
  p: {
    mb: 3,
    mt: 0,
  },
}

class Markdown extends React.Component<MarkdownProps, {}> {
  public render() {
    const { text = '', scope, library } = this.props
    const defaultScope = markdownComponents({ library })

    const mappedScope = this.mapScope({ ...defaultScope, ...scope })
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

  private mapScope = (scope: any) => {
    const comps = {
      a: link(scope.Link),
      blockquote: scope.Blockquote,
      code: scope.Code,
      h1: heading(scope.Title || scope.Heading || scope.H1),
      h2: heading(scope.Heading || scope.H2),
      h3: heading(scope.Subhead || scope.H3),
      hr: scope.Divider,
      p: scope.Text,
      pre: scope.Pre,
      table: scope.Table,
    }

    return comps
  }

  private applyProps = (scope: any) => {
    const { options = {} } = this.props
    // @ts-ignore
    const props = { ...defaultProps, ...options.markdownProps }
    Object.keys(props).forEach(key => {
      if (!scope[key]) {
        return
      }
      scope[key].defaultProps = { ...scope[key].defaultProps, ...props[key] }
    })
    return scope
  }
}

export default Markdown
