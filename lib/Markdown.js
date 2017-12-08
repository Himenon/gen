const React = require('react')
const PropTypes = require('prop-types')
const remark = require('remark')
const remarkSlug = require('remark-slug')
const remarkReact = require('remark-react')

const markdownComponents = require('./markdownComponents')

const heading = Comp => props => {
  return (
    React.createElement(Comp, props,
      React.createElement('a', {
        href: '#' + props.id,
        style: {
          color: 'inherit',
          textDecoration: 'none'
        }
      },
        props.children
      )
    )
  )
}

const relativize = href => /\.md$/.test(href) ? href.replace(/\.md$/, '/') : href

const link = Comp => props => (
  React.createElement(Comp, Object.assign({}, props, {
    href: relativize(props.href)
  }))
)

class Markdown extends React.Component {
  constructor () {
    super()

    this.mapScope = scope => {
      return {
        h1: heading(scope.Title || scope.Heading || scope.H1),
        h2: heading(scope.Heading || scope.H2),
        h3: heading(scope.Subhead || scope.H3),
        p: scope.Text,
        a: link(scope.Link),
        // pre: scope.Pre,
        // code: scope.Code,
        // table: scope.Table,
      }
    }
  }

  render() {
    const { text = '', scope, library } = this.props
    const defaultScope = markdownComponents({ library })

    const mappedScope = this.mapScope(Object.assign({}, defaultScope, scope))
    const remarkReactComponents = Object.assign({}, defaultScope, mappedScope, scope)
    // const text = React.Children.toArray(children)
    //   .filter(child => typeof child === 'string')
    //   .join('\n\n')
    const opts = {
      // pass Lab components to remark-react for rendering
      remarkReactComponents,
      toHast: {
        handlers: {
          // code: codeHandler
        }
      }
    }
    const element = remark()
      .use(remarkSlug)
      .use(remarkReact, opts)
      .processSync(text).contents

    return element
  }
}

Markdown.propTypes = {
  scope: PropTypes.object
}

module.exports = Markdown
