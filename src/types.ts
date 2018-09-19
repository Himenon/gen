export type Options = any

export interface MarkdownProps {
  h1: { [key in string]: number }
  h2: { [key in string]: number }
  h3: { [key in string]: number }
  p: { [key in string]: number }
  options?: { [key in string]: number }
  text?: string
  scope: any
  library: any
}

export interface CreateHtmlData {
  title?: string
  og?: string
  twitter?: string
  scripts?: any
  stylesheets?: string
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
