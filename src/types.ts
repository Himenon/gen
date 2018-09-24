export type Options = any

export type Library = string

export interface MarkdownProps {
  h1: { [key in string]: number }
  h2: { [key in string]: number }
  h3: { [key in string]: number }
  p: { [key in string]: number }
  options?: { [key in string]: number }
  text?: string
  scope?: any
  library?: Library
}

export interface CreateHtmlData {
  title?: string
  og?: string
  twitter?: string
  scripts?: any
  stylesheets?: string
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

export interface RenderPage extends FirstPage {
  html: string
}

export interface Content {
  dirname: any
  lab: any
  pages: FirstPage[]
  theme: any
}
