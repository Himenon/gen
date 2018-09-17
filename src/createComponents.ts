import * as system from 'styled-system'
import styled from 'styled-components'
import * as glamorous from 'glamorous'

const { toComponent } = require('./jsx')

const componentCreators = {
  'styled-components': ({
    name,
    type,
    style,
    props,
    system = [],
  }, lib) => {
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    const Comp = styled(tag)([], style, ...funcs)

    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  },
  glamorous: ({
    name,
    type,
    style,
    props,
    system = [],
  }, lib) => {
    // todo: DRY up
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    const Comp = glamorous(tag)(style, ...funcs)

    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  }
}

export default componentCreators['styled-components']

const createScope = (imports: any, lib: any) => imports
  .map( (key: string) => ({
    key,
    value: lib[key]
  }))
  .reduce((a: any, b: any) => Object.assign(a, {
    [b.key]: b.value
  }), {})

const createComposite = (comp: any, lib: any) => {
  // todo npm/local modules scope
  const scope = createScope(comp.imports, lib)
  const Comp = toComponent(comp.jsx, scope)
  return Comp
}

const defaultFuncs = [
  'space',
  'fontSize',
  'width',
  'color'
]

const getFunctions = (funcs: any) => [
  ...defaultFuncs,
  ...funcs
].map(key => system[key])
  .filter(func => typeof func === 'function')

const isBase = ({ type }) => type && /[a-z]/.test(type)
const isExtension = ({ type }) => type && /[A-Z]/.test(type)
const isComposite = ({ type, imports, jsx }) => !type && imports && jsx
const isExternal = ({ external }) => external

const mergeComponents = create => (a, comp) =>
  Object.assign(a, {
    [comp.name]: create(comp, a)
  }, {})

const createComponent = (opts: any) => (comp: any, lib: any) => {
  if (isExternal(comp)) return null
  if (isComposite(comp)) return createComposite(comp, lib)
  if (!comp.name || !comp.type || !comp.style) return null

  const library = opts.library || 'styled-components'
  const sx = componentCreators[library] || componentCreators.default

  return sx(comp, lib)
}

export const createComponents = (config = [], opts = {}) => {
  const base = config.filter(isBase)
  const extensions = config.filter(isExtension)
  const composites = config.filter(isComposite)
  const externals = config.filter(isExternal)

  const sorted = [
    ...base,
    ...extensions,
    ...composites,
    ...externals
  ]

  const create = createComponent(opts)

  const components = sorted.reduce(mergeComponents(create), {})

  return components
}
