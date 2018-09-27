import { Options } from '@gen'

import { getData } from './getData'
import { render, RenderPage } from './render'
import { writePages } from './writePages'

export const generateStatic = async (dirname: string, opts: Options): Promise<RenderPage[]> => {
  const data = await getData(dirname, opts)
  const pages = await render(data, opts)
  const result = await writePages(pages, opts)
  return result
}
