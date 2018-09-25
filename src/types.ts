import { SpaceProps } from 'styled-system'

export type Options = any
export interface Options2 extends Options {
  dirname?: string
  library?: Library
  pages?: FirstPage[]
  lab?: Lab
}

export type Library = string

export type Lib = ComponentConfig | {}

export interface MarkdownProps {
  h1: { [keys: string]: number }
  h2: { [keys: string]: number }
  h3: { [keys: string]: number }
  p: { [keys: string]: number }
  options?: { [keys: string]: object }
  text?: string
  scope?: ScopedComponents
  library?: Library
}

export interface CreateHtmlData {
  title?: string
  og?: string
  twitter?: string
  scripts?: string[]
  stylesheets?: string[]
  layout?: string
}

export interface CreateHtmlOption {
  data: CreateHtmlData
  css: string
  fontLinks: string
  body: string
}

export interface FirstPage {
  content: string
  // ここかJSXの設定系
  data: CreateHtmlData
  ext: string
  filename: string
  name: string
  raw: string
  layoutJSX?: string
}

export type GenImporter = any

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

export interface HeadingProps {
  id: string
  children?: React.ReactNode[]
}

export interface AnchorProps {
  href: string
  children?: React.ReactNode[]
}

// tslint:disable
export type BasicComponentProps = {}
export type Style = { [key: string]: string | number | Style }
export type GenerateStyle = (props: any) => Style

export interface ComponentConfig {
  name: ScopedName
  type: ScopedType
  style: Style | GenerateStyle
  // props: ComponentProps & SpaceProps
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
  imports?: GenImporter[]
  jsx?: string
  external?: any // Unknown
}

export interface RenderPage extends FirstPage {
  html: string
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
  pages: FirstPage[]
  theme: Theme | unknown
}
