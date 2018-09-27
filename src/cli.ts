#!/usr/bin/env node

import chalk from 'chalk'
import * as dot from 'dot-prop'
import * as http from 'http'
import * as meow from 'meow'
import opn = require('opn')
import * as path from 'path'
import * as readPkgUp from 'read-pkg-up'
import { UpdateNotifier } from 'update-notifier'

import { Options } from '@gen'

const pkg = require('../package.json')
new UpdateNotifier({ pkg }).notify()

import { getData } from './getData'
import { render } from './render'
import { server } from './server'
import { writePages } from './writePages'

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
    .then((srv: http.Server) => {
      const address = srv.address()
      let url: string
      if (typeof address === 'string') {
        log(`listening on ${address}`)
        url = address
      } else {
        const { port } = address
        log(`listening on port: ${port}`)
        url = `http://localhost:${port}`
      }
      if (localOpts.open) {
        opn(url)
      }
    })
    .catch((err: Error) => {
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
