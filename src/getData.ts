import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import * as loadJSON from 'load-json-file'
import * as matter from 'gray-matter'

const readdir = promisify(fs.readdir)

export const getContent = async (dirname: string, opts: any) => {
  let theme = {}
  let lab = { components: [] }
  try {
    theme = await loadJSON(path.join(dirname, 'theme.json'))
  } catch (err) {
    // console.log('no theme.json found')
  }

  try {
    lab = await loadJSON(path.join(dirname, 'lab.json'))
  } catch (err) {
    // console.log('no lab.json found')
  }

  const allFiles = await readdir(dirname)
  const filenames = allFiles.filter(name => !/^\./.test(name))
  const jsxFilenames = filenames.filter(name => /\.jsx$/.test(name))
  const mdFilenames = filenames.filter(name => /\.md/.test(name))

  const contentFiles = [...jsxFilenames, ...mdFilenames]
  const promises = contentFiles.map(getPage(dirname))
  const pages = await Promise.all(promises)
  const withLayouts = pages.map(getLayout(pages))

  return {
    dirname,
    theme,
    lab,
    pages: withLayouts,
  }
}

const getPage = (dirname: string) => async (filename: string) => {
  const ext = path.extname(filename)
  const name = path.basename(filename, ext)
  // const raw = await readFile(path.join(dirname, filename), 'utf8')
  const raw = fs.readFileSync(path.join(dirname, filename), 'utf8')
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

const getLayout = (pages: any) => (page: any) => {
  if (page.ext !== '.md') return page
  if (!page.data.layout) return page
  const layout = pages.find((p: any) => p.name === page.data.layout)
  if (!layout) return page
  page.data = Object.assign({}, layout.data, page.data)
  page.layoutJSX = layout.content
  return page
}

export { getContent as getData }
