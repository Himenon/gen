import * as system from 'styled-system'
import styled from 'styled-components'
import glamorous from 'glamorous'

const { toComponent } = require('./jsx')

export interface Options {
  name: string
  type: string
  style: string
  props: string
  system: any[]
}

export interface GlamorousOptions {
  name: string
  type: string
  style: any
  props: any
  system: any[]
}

const componentCreators = {
  'styled-components': ({ name, type, style, props, system = [] }: Options, lib: any) => {
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    // @ts-ignore
    const Comp = styled(tag)([], style, ...funcs)

    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  },
  glamorous: ({ name, type, style, props, system = [] }: GlamorousOptions, lib: any) => {
    // todo: DRY up
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    const Comp = glamorous(tag)(style, ...funcs)

    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  },
}

// componentCreators.default = componentCreators['styled-components']

const createScope = (imports: any, lib: any) =>
  imports
    .map((key: string) => ({
      key,
      value: lib[key],
    }))
    .reduce(
      (a: any, b: any) =>
        Object.assign(a, {
          [b.key]: b.value,
        }),
      {},
    )

export const createComposite = (comp: any, lib: any) => {
  // todo npm/local modules scope
  const scope = createScope(comp.imports, lib)
  const Comp = toComponent(comp.jsx, scope)
  return Comp
}

const defaultFuncs = ['space', 'fontSize', 'width', 'color']

export type MyType = { type: string }
export interface CompositeType {
  type: string
  imports: any
  jsx: JSX.Element
}

const getFunctions = (funcs: any) => [...defaultFuncs, ...funcs].map(key => system[key]).filter(func => typeof func === 'function')

const isBase = ({ type }: MyType) => type && /[a-z]/.test(type)
const isExtension = ({ type }: MyType) => type && /[A-Z]/.test(type)
const isComposite = ({ type, imports, jsx }: CompositeType) => !type && imports && jsx
const isExternal = ({ external }: { external: any }) => external

const mergeComponents = (create: any) => (a: any, comp: any) =>
  Object.assign(
    a,
    {
      [comp.name]: create(comp, a),
    },
    {},
  )

const createComponent = (opts: any) => (comp: any, lib: any) => {
  if (isExternal(comp)) return null
  if (isComposite(comp)) return createComposite(comp, lib)
  if (!comp.name || !comp.type || !comp.style) return null

  const library = opts.library || 'styled-components'
  const sx = componentCreators[library] // || componentCreators.default

  return sx(comp, lib)
}

export const createComponents = (config: any[] = [], opts: any = {}) => {
  const base = config.filter(isBase)
  const extensions = config.filter(isExtension)
  const composites = config.filter(isComposite)
  const externals = config.filter(isExternal)

  const sorted = [...base, ...extensions, ...composites, ...externals]

  const create = createComponent(opts)

  const components = sorted.reduce(mergeComponents(create), {})

  return components
}
