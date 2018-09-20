import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import * as url from 'url'

import * as chokidar from 'chokidar'
import * as portfinder from 'portfinder'
import * as WebSocket from 'ws'

import { getData } from './getData'
import { render } from './render'
import { Options } from './types'

const getPages = async (dirname: string, opts: Options) => {
  const data = await getData(dirname, opts)
  const pages = await render(data, opts)
  return pages
}

const start = async (dirname: string, opts: Options) => {
  const socketPort: number = await portfinder.getPortPromise()

  let socket: WebSocket
  let gPages = await getPages(dirname, opts)

  /**
   * ファイル
   */
  const watcher: chokidar.FSWatcher = chokidar.watch(dirname, {
    depth: 1,
    ignoreInitial: true,
    ignored: '!*.(jsx|md|json)',
  })

  const socketServer = new WebSocket.Server({ port: socketPort })

  socketServer.on('connection', (res: WebSocket) => {
    socket = res
  })

  socketServer.on('error', (err: any) => {
    console.error('connection error:', JSON.stringify(err))
  })

  socketServer.on('close', (res: WebSocket) => {
    console.log('connection closed')
  })

  const update = async () => {
    if (!socket) {
      return
    }
    gPages = await getPages(dirname, opts)
    socket.send(JSON.stringify({ reload: true }))
  }

  /**
   * ファイルの変更があった場合に更新を通知する
   */
  watcher.on('change', async (filename: string) => {
    if (!socket) {
      return
    }
    const base = path.basename(filename)
    const ext = path.extname(base)
    if (!/\.(jsx|md|json)$/.test(ext)) {
      return
    }
    // todo: handle this per file
    update()
  })

  /**
   * WebServer
   */
  const app = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    if (!req.url) {
      return
    }
    const { pathname } = url.parse(req.url)
    if (!pathname) {
      return
    }
    const filepath = path.join(dirname, pathname)
    // serve local images and files
    if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
      fs.createReadStream(filepath).pipe(res)
      return
    }

    const name = pathname === '/' ? 'index' : pathname.replace(/^\//, '').replace(/\/$/, '')
    const page = gPages.find((localPage: any) => localPage.name === name)

    if (!page) {
      res.write('page not found: ' + pathname)
      res.end()
      return
    }
    res.write(page.html)
    res.write(makeScript(socketPort))
    res.end()
  })

  try {
    const server = await app.listen(socketPort + 2)
    return server
  } catch (err) {
    console.log(err)
    throw err
  }
}

const makeScript = (port: number) => `<script type='text/javascript'>
const socket = new WebSocket('ws://localhost:${port}')
socket.onmessage = msg => {
  const data = JSON.parse(msg.data)
  if (data.reload) {
    window.location.reload()
  }
}
</script>`

export { start as server }
