import * as fs from 'fs'
import * as matter from 'gray-matter'
import loadJsonFile from 'load-json-file'
import * as path from 'path'
import { promisify } from 'util'

import { Content, FirstPage, Lab, Options, Theme } from './types'

const readdir = promisify(fs.readdir)

export const getContent = async (dirname: string, opts: Options): Promise<Content> => {
  let theme: Theme | unknown = {}
  let lab: Lab = {}
  try {
    theme = await loadJsonFile<Theme>(path.join(dirname, 'theme.json'))
  } catch (err) {
    console.log('no theme.json found')
  }

  try {
    lab = await loadJsonFile<Lab>(path.join(dirname, 'lab.json'))
  } catch (err) {
    console.log('no lab.json found')
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
    lab,
    pages: withLayouts,
    theme,
  }
}

const getPage = (dirname: string) => async (filename: string): Promise<FirstPage> => {
  const ext = path.extname(filename)
  const name = path.basename(filename, ext)
  // const raw = await readFile(path.join(dirname, filename), 'utf8')
  const raw = fs.readFileSync(path.join(dirname, filename), 'utf8')
  const { data, content } = matter(raw)

  return {
    content,
    data,
    ext,
    filename,
    name,
    raw,
  }
}

const getLayout = (pages: FirstPage[]) => (page: FirstPage): FirstPage => {
  if (page.ext !== '.md') {
    return page
  }
  if (!page.data.layout) {
    return page
  }
  const layout = pages.find((p: FirstPage) => p.name === page.data.layout)
  if (!layout) {
    return page
  }
  page.data = { ...layout.data, ...page.data }
  page.layoutJSX = layout.content
  return page
}

export { getContent as getData }
