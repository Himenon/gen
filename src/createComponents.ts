import glamorous from 'glamorous'
import styled from 'styled-components'
import * as styledSystem from 'styled-system'

const { toComponent } = require('./jsx')
import { GlamorousOptions, Library, StyledOptions } from './types'

const componentCreators = {
  glamorous: ({ name, type, style, props, system = [] }: GlamorousOptions, lib: any) => {
    // todo: DRY up
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    const Comp = glamorous(tag)(style, ...funcs)

    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  },
  'styled-components': ({ name, type, style, props, system = [] }: StyledOptions, lib: any) => {
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    // @ts-ignore
    const Comp = styled(tag)([], style, ...funcs)

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
      (a: any, b: any) => ({
        ...a,
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

const getFunctions = (funcs: any) => [...defaultFuncs, ...funcs].map(key => styledSystem[key]).filter(func => typeof func === 'function')

const isBase = ({ type }: CompositeComponent) => type && /[a-z]/.test(type)
const isExtension = ({ type }: CompositeComponent) => type && /[A-Z]/.test(type)
const isComposite = ({ type, imports, jsx }: CompositeComponent) => !type && imports && jsx
const isExternal = ({ external }: CompositeComponent) => external

const mergeComponents = (create: any) => (a: object, comp: any) => ({
  ...a,

  [comp.name]: create(comp, a),
})

export interface CompositeComponent {
  name?: string
  props: object
  style?: object
  system: string[]
  type?: string
  imports: any
  jsx: JSX.Element
  external?: any
}

const createComponent = (opts: { library?: Library }) => (comp: CompositeComponent, lib: object): null | any => {
  if (isExternal(comp)) {
    return null
  }
  if (isComposite(comp)) {
    return createComposite(comp, lib)
  }
  if (!comp.name || !comp.type || !comp.style) {
    return null
  }

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
