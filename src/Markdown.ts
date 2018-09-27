import * as React from 'react'
// @ts-ignore
import * as remark from 'remark'
// @ts-ignore
import * as remarkReact from 'remark-react'
// @ts-ignore
import * as remarkSlug from 'remark-slug'

import { AnchorProps, HeadingProps, MappedScope, ScopedComponent, ScopedComponents } from '@gen'
import { markdownComponents } from './markdownComponents'

export interface MarkdownProps {
  h1: { [key: string]: number }
  h2: { [key: string]: number }
  h3: { [key: string]: number }
  p: { [key: string]: number }
  options?: { [key: string]: object }
  text?: string
  scope?: ScopedComponents
  library?: string
}

const heading = (Comp: ScopedComponent) => (props: HeadingProps): React.ReactNode => {
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

const link = (Comp: ScopedComponent) => (props: AnchorProps) =>
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

  private mapScope = (scope: ScopedComponents): MappedScope => {
    const a = scope.Link
    const h1 = scope.Title || scope.Heading || scope.H1
    const h2 = scope.Heading || scope.H2
    const h3 = scope.Subhead || scope.H3
    return {
      a: a ? link(a) : undefined,
      blockquote: scope.Blockquote,
      code: scope.Code,
      h1: h1 ? heading(h1) : undefined,
      h2: h2 ? heading(h2) : undefined,
      h3: h3 ? heading(h3) : undefined,
      hr: scope.Divider,
      p: scope.Text,
      pre: scope.Pre,
      table: scope.Table,
    }
  }

  private applyProps = (scope: MappedScope) => {
    const { options = {} } = this.props
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
