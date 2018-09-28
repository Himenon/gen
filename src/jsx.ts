// @ts-ignore
import * as transformJSX from '@babel/plugin-transform-react-jsx'
// @ts-ignore
import * as babel from '@babel/standalone'
import * as React from 'react'

import { ScopedComponents } from '@gen'

// https://github.com/babel/babel/blob/master/packages/babel-core/src/transformation/index.js#L20-L26
const parse = (raw: string): string | null =>
  babel.transform(raw, {
    plugins: [transformJSX],
  }).code

const wrap = (jsx: string) => `<React.Fragment>${jsx}</React.Fragment>`

export const toComponent = (jsx: string, scope: ScopedComponents = {}) => {
  const el = parse(wrap(jsx))
  const scopeKeys = Object.keys(scope)
  const scopeValues = scopeKeys.map(key => scope[key])
  const create = new Function('React', ...scopeKeys, `return props => ${el}`)
  const Comp = create(React, ...scopeValues)
  // todo: validate
  return Comp
}
