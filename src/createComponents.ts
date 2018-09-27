import { ComponentConfig, GenImporter, Options2, ScopedComponent, ScopedComponents } from '@gen'
import glamorous from 'glamorous'
import styled from 'styled-components'
import * as styledSystem from 'styled-system'
import { toComponent } from './jsx'

export type Lib = ComponentConfig | {}

class EmptyTemplateStringsArray extends Array implements TemplateStringsArray {
  public readonly raw = []
}

// type CreateFunction = (comp: ComponentConfig, lib: Lib) => null | ScopedComponent;

/**
 * styled-componentsまたはglamorousのどちらかでCSSをつける
 */
const componentCreators: { [key: string]: (comp: ComponentConfig, lib: Lib) => ScopedComponent } = {
  glamorous: ({ name, type, style, props, system = [] }, lib) => {
    // todo: DRY up
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    const Comp = glamorous(tag)(style, ...funcs)

    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  },
  'styled-components': ({ name, type, style, props, system = [] }, lib) => {
    const tag = lib[type] || type
    const funcs = getFunctions(system)
    const Comp = styled(tag)(new EmptyTemplateStringsArray(), style, ...funcs)
    Comp.defaultProps = props
    Comp.displayName = name

    return Comp
  },
}

const createScope = (imports: GenImporter[], lib: Lib) =>
  imports
    .map((key: string) => ({
      key,
      value: lib[key],
    }))
    .reduce(
      (a: GenImporter, b: GenImporter) => ({
        ...a,
        [b.key]: b.value,
      }),
      {},
    )

const createComposite = (comp: ComponentConfig, lib: Lib): ScopedComponent => {
  // todo npm/local modules scope
  const scope = createScope(comp.imports!, lib)
  const Comp = toComponent(comp.jsx!, scope)
  return Comp
}

const defaultFuncs = ['space', 'fontSize', 'width', 'color']

const getFunctions = (funcs: string[]) =>
  [...defaultFuncs, ...funcs].map(key => styledSystem[key]).filter(func => typeof func === 'function')

const isBase = ({ type }: ComponentConfig) => type && /[a-z]/.test(type)
const isExtension = ({ type }: ComponentConfig) => type && /[A-Z]/.test(type)
const isComposite = ({ type, imports, jsx }: ComponentConfig) => !type && imports && jsx
const isExternal = ({ external }: ComponentConfig) => external

const mergeComponents = (create: (comp: ComponentConfig, lib: Lib) => null | ScopedComponent) => (
  prevComp: ComponentConfig | {},
  nextComp: ComponentConfig,
) => {
  return {
    ...prevComp,
    [nextComp.name]: create(nextComp, prevComp),
  }
}

const createComponent = (opts: Options2) => (comp: ComponentConfig, lib: Lib): null | ScopedComponent => {
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
  // 利用するfunctionを指定する
  const sx = componentCreators[library]
  return sx(comp, lib)
}

/**
 * Scopeを返す
 * @param config
 * @param opts
 */
export const createComponents = (config: ComponentConfig[] = [], opts: Options2 = {}): ScopedComponents => {
  const base = config.filter(isBase)
  const extensions = config.filter(isExtension)
  const composites = config.filter(isComposite)
  const externals = config.filter(isExternal)

  const sorted = [...base, ...extensions, ...composites, ...externals]

  const create = createComponent(opts)
  // 複数のComponentを作っていく
  const components = sorted.reduce(mergeComponents(create), {})

  return components
}
