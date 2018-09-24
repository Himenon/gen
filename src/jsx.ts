// @ts-ignore
import * as transformJSX from '@babel/plugin-transform-react-jsx'
// @ts-ignore
import * as babel from '@babel/standalone'
import * as React from 'react'

const parse = (raw: string) =>
  babel.transform(raw, {
    plugins: [transformJSX],
  }).code

const wrap = (jsx: string) => `<React.Fragment>${jsx}</React.Fragment>`

const toComponent = (jsx: string, scope = {}) => {
  const el = parse(wrap(jsx))
  const scopeKeys = Object.keys(scope)
  const scopeValues = scopeKeys.map(key => scope[key])
  const create = new Function('React', ...scopeKeys, `return props => ${el}`)
  const Comp = create(React, ...scopeValues)
  // todo: validate
  return Comp
}

export { parse, toComponent }
