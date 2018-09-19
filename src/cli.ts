#!/usr/bin/env node

import chalk from 'chalk'
import * as dot from 'dot-prop'
import * as meow from 'meow'
// @ts-ignore
import * as open from 'opn'
import * as path from 'path'
import * as readPkgUp from 'read-pkg-up'

const pkg = require('../package.json')
require('update-notifier')({ pkg }).notify()

import { getData, render, server, writePages } from './index'

const log = (...msgs: any[]) => {
  console.log(chalk.black.bgCyan(' gen '), chalk.cyan(...msgs))
}

const cli = meow(
  `
  Usage:
    $ gen dirname

  Options:
    --out-dir, -d   Output directory
    --dev, -D       Start development server
    --port, -p      Set port for development server
    --open, -o      Open development server in default browser
`,
  {
    flags: {
      outDir: {
        type: 'string',
        alias: 'd',
      },
      dev: {
        type: 'boolean',
        alias: 'D',
      },
      port: {
        type: 'string',
        alias: 'p',
      },
      open: {
        type: 'boolean',
        alias: 'o',
      },
    },
  },
)

const [dirname = process.cwd()] = cli.input
const userPkg = readPkgUp.sync({ cwd: dirname }) || {}
const opts = {
  ...dot.get(userPkg, 'pkg.gen'),
  ...cli.flags,
  outDir: path.join(process.cwd(), cli.flags.outDir || ''),
}

const create = async (dirname: string, opts: any) => {
  const data = await getData(dirname, opts)
  const pages = await render(data, opts)
  const result = await writePages(pages, opts)
  return result
}

log('@compositor/gen')

if (opts.dev) {
  log('starting dev server')
  server(dirname, opts)
    .then((srv: any) => {
      const { port } = srv.address() || ({} as { port: number })
      log(`listening on port: ${port}`)
      const url = `http://localhost:${port}`
      if (opts.open) {
        open(url)
      }
    })
    .catch((err: any) => {
      log('error', err)
      process.exit(1)
    })
} else {
  create(dirname, opts)
    .then(result => {
      log('files saved to', dirname)
    })
    .catch(err => {
      log('error', err)
      process.exit(1)
    })
}
