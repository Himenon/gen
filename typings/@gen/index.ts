import { SpaceProps } from 'styled-system'

export interface HtmlMetaData {
  description?: string
  title?: string
  og?: { [key: string]: string }
  twitter?: { [key: string]: string }
  scripts?: string[]
  stylesheets?: string[]
  layout?: string
}

export interface PageData {
  content: string
  data: HtmlMetaData
  ext: string
  filename: string
  name: string
  raw: string
  layoutJSX?: string
}

export interface Options {
  outDir?: string
}
export interface LocalOptions extends Options {
  dirname?: string
  library?: string
  pages?: PageData[]
  lab?: Lab
}

export type CustomImporter = any

export type ScopedName =
  | 'Title'
  | 'Heading'
  | 'Subhead'
  | 'Pre'
  | 'Code'
  | 'Table'
  | 'Divider'
  | 'Blockquote'
  | 'Box'
  | 'Flex'
  | 'Grid'
  | 'Text'
  | 'Link'
  | 'Image'
  | 'Font'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'DefaultLayout'
  | 'theme'
export type ScopedType = 'Box' | keyof JSX.IntrinsicElements

export type ScopedComponent = any | Theme
export type ScopedComponents = { [key in ScopedName]?: ScopedComponent }
export type MappedScope = { [key in ScopedType]?: ScopedComponent }

export interface Style {
  [key: string]: string | number | Style
}
export type GenerateStyle = (props: any) => Style

export interface ComponentConfig {
  name: ScopedName
  type: ScopedType
  style: Style | GenerateStyle
  props: {
    fontSize?: number
    fontWeight?: string
    borderWidth?: number
    borderLeft?: boolean
    borderBottom?: boolean
    borderColor?: string
    color?: string
  } & SpaceProps
  system?: string[]
  imports?: CustomImporter[]
  jsx?: string
  external?: any // Unknown
}

export interface Lab {
  library?: string
  components?: ComponentConfig[]
}

export interface Theme {
  [key: string]: unknown
}

export interface Content {
  dirname: string
  lab: Lab
  pages: PageData[]
  theme: Theme | unknown
}
