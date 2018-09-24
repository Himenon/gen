import { SpaceProps } from 'styled-system'

export type Options = any

export type Library = string

export interface MarkdownProps {
  h1: { [keys: string]: number }
  h2: { [keys: string]: number }
  h3: { [keys: string]: number }
  p: { [keys: string]: number }
  options?: { [keys: string]: number }
  text?: string
  scope?: any
  library?: Library
}

export interface CreateHtmlData {
  title?: string
  og?: string
  twitter?: string
  scripts?: any
  stylesheets?: string[]
  layout?: string
}

export interface CreateHtmlOption {
  data: CreateHtmlData
  css: string
  fontLinks: string
  body: string
}

export interface StyledOptions {
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

export interface ComponentConfig {
  name: string
  type?: string
  style: any
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
  external?: any
}

export interface RenderPage extends FirstPage {
  html: string
}

export interface Lab {
  library?: string
  components?: ComponentConfig[]
}

export interface Content {
  dirname: string
  lab: Lab
  pages: FirstPage[]
  theme: object | unknown
}
