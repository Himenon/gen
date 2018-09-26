import { SpaceProps } from 'styled-system'

export interface CreateHtmlData {
  description?: string
  title?: string
  og?: { [key: string]: string }
  twitter?: { [key: string]: string }
  scripts?: string[]
  stylesheets?: string[]
  layout?: string
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

// 切り離せなかったものは上に

export interface Options {
  outDir?: string
}
export interface Options2 extends Options {
  dirname?: string
  library?: string
  pages?: FirstPage[]
  lab?: Lab
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

export interface Style {
  [key: string]: string | number | Style
}
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
