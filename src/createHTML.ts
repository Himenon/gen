export interface IData {
  title?: string
  og?: string
  twitter?: string
  scripts?: any
  stylesheets?: string
}

export interface ICreateHTML {
  data: IData
  css: string
  fontLinks: string
  body: string
}

export default ({
  data = {},
  css = '',
  fontLinks = '',
  body = ''
}: ICreateHTML) => {
  const meta = getMeta(data)

  return [
    '<!DOCTYPE html>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta http-equiv="x-ua-compatible" content="ie=edge">',
    '<meta name="generator" content="Compositor Gen">',
    `<title>${data.title}</title>`,
    meta('description'),
    getOG(data.og),
    getTwitterCard(data.twitter),
    fontLinks,
    getStylesheets(data.stylesheets),
    `<style>${baseCSS}</style>`,
    css,
    '<body>',
    body,
    getScripts(data.scripts),
    '</body>',
  ].filter(n => !!n)
  .join('')
}

const getMeta = (data: any) => (key: string, name?: string) =>
  data[key] ? `<meta name='${name || key}' content='${data[key]}'>` : ''

const getStylesheets = (stylesheets: any) => Array.isArray(stylesheets)
  ? stylesheets.map(href => `<link rel='stylesheet' href='${href}'>`)
  : ''

const getOG = (og = {}) => Object.keys(og || {})
  .map(key => getMeta(og)(key, 'og:' + key))
  .join('')

const getTwitterCard = (twitter = {}) => Object.keys(twitter || {})
  .map(key => getMeta(twitter)(key, 'twitter:' + key))
  .join('')

const getScripts = (scripts: any) => Array.isArray(scripts)
  ? scripts.map(script => `<script>${script}</script>`)
  : ''

const baseCSS = `*{box-sizing:border-box}body{margin:0}`
