import * as path from 'path'

import { getData } from '../getData'
import { markdownComponents } from '../markdownComponents'
import { primitives } from '../primitives'
import { render } from '../render'

const dirname = path.join(__dirname, '../../examples')

test('getData reads theme.json, lab.json, .jsx, and .md files', async () => {
  const data = await getData(dirname, {})
  expect(data).toMatchSnapshot()
})

test('render creates pages', async () => {
  const data = await getData(dirname, {})
  const pages = await render(data, {})
  expect(pages).toMatchSnapshot()
})

test('exports primitives config', () => {
  expect(primitives).toMatchSnapshot()
})

test('generates markdown components', () => {
  const components = markdownComponents({})
  expect(components).toMatchSnapshot()
})
