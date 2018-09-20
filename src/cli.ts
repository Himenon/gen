#!/usr/bin/env node

import chalk from 'chalk'
import * as dot from 'dot-prop'
import * as meow from 'meow'
import opn = require('opn')
import * as path from 'path'
import * as readPkgUp from 'read-pkg-up'

import { Options } from './types'

const pkg = require('../package.json')
require('update-notifier')({ pkg }).notify()

import { getData, render, server, writePages } from './index'

/**
 * DebugMessage用
 * @param messages anyで良い
 */
const log = (...messages: any[]) => {
  console.log(chalk.black.bgCyan(' gen '), chalk.cyan(...messages))
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
      dev: {
        alias: 'D',
        type: 'boolean',
      },
      open: {
        alias: 'o',
        type: 'boolean',
      },
      outDir: {
        alias: 'd',
        type: 'string',
      },
      port: {
        alias: 'p',
        type: 'string',
      },
    },
  },
)

const [localDirname = process.cwd()] = cli.input
const userPkg = readPkgUp.sync({ cwd: localDirname }) || {}
const localOpts = {
  ...dot.get(userPkg, 'pkg.gen'),
  ...cli.flags,
  outDir: path.join(process.cwd(), cli.flags.outDir || ''),
}

const create = async (dirname: string, opts: Options) => {
  const data = await getData(dirname, opts)
  const pages = await render(data, opts)
  const result = await writePages(pages, opts)
  return result
}

log('@compositor/gen')

if (localOpts.dev) {
  log('starting dev server')
  server(localDirname, localOpts)
    .then((srv: any) => {
      const { port } = srv.address()
      log(`listening on port: ${port}`)
      const url = `http://localhost:${port}`
      if (localOpts.open) {
        opn(url)
      }
    })
    .catch((err: any) => {
      log('error', err)
      process.exit(1)
    })
} else {
  // 開発環境ではなく、サイトを生成する
  create(localDirname, localOpts)
    .then(result => {
      log('files saved to', localDirname)
    })
    .catch(err => {
      log('error', err)
      process.exit(1)
    })
}
