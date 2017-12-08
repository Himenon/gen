const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const loadJSON = require('load-json-file')
const matter = require('gray-matter')

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

const getContent = async dirname => {
  const theme = await loadJSON(path.join(dirname, 'theme.json'))
  const lab = await loadJSON(path.join(dirname, 'lab.json'))
  const filenames = await readdir(dirname)
  const jsxFilenames = filenames.filter(name => /\.jsx$/.test(name))
  const mdFilenames = filenames.filter(name => /\.md/.test(name))

  const contentFiles = [ ...jsxFilenames, ...mdFilenames ]
  const promises = contentFiles.map(getPage(dirname))
  const pages = await Promise.all(promises)
  const withLayouts = pages.map(getLayout(pages))

  return {
    dirname,
    theme,
    lab,
    pages: withLayouts
  }
}

const getPage = dirname => async filename => {
  const ext = path.extname(filename)
  const name = path.basename(filename, ext)
  const raw = await readFile(path.join(dirname, filename), 'utf8')
  const { data, content } = matter(raw)

  return {
    filename,
    name,
    ext,
    raw,
    data,
    content,
  }
}

const getLayout = pages => page => {
  if (page.ext !== '.md') return page
  if (!page.data.layout) return page
  const layout = pages.find(p => p.name === page.data.layout)
  if (!layout) return page
  page.data = Object.assign({}, layout.data, page.data)
  page.layoutJSX = layout.content
  return page
}

module.exports = getContent
