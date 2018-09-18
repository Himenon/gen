import * as fs from 'fs'
import * as http from 'http'
import * as url from 'url'
import * as path from 'path'

import * as React from 'react'
import * as chokidar from 'chokidar'
import * as portfinder from 'portfinder'
import * as WebSocket from 'ws'

import { getContent as getData } from './getData'
import { render } from './render'

const getPages = async (dirname: string, opts: any) => {
  const data = await getData(dirname)
  const pages = await render(data, opts)
  return pages
}

const start = async (dirname: string, opts: any) => {
  if (opts.port) {
    portfinder.basePort = parseInt(opts.port)
  }
  const port = await portfinder.getPortPromise()
  portfinder.basePort = port + 2
  const socketPort = await portfinder.getPortPromise()

  let socket: any
  let pages = await getPages(dirname, opts)

  const watcher = chokidar.watch(dirname, {
    depth: 1,
    ignoreInitial: true,
    ignored: '!*.(jsx|md|json)',
  })

  const socketServer = new WebSocket.Server({ port: socketPort })

  socketServer.on('connection', (res: WebSocket) => {
    socket = res
  })

  const update = async () => {
    if (!socket) return
    pages = await getPages(dirname, opts)
    socket.send(JSON.stringify({ reload: true }))
  }

  watcher.on('change', async (filename: string) => {
    if (!socket) return
    const base = path.basename(filename)
    const ext = path.extname(base)
    if (!/\.(jsx|md|json)$/.test(ext)) return
    // todo: handle this per file
    update()
  })

  const app = http.createServer((req: any, res: any) => {
    const { pathname } = url.parse(req.url)
    const filepath = path.join(dirname, pathname as string)

    // serve local images and files
    if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
      fs.createReadStream(filepath).pipe(res)
      return
    }

    const name = pathname === '/' ? 'index' : (pathname as string).replace(/^\//, '').replace(/\/$/, '')
    const page = pages.find((page: any) => page.name === name)
    if (!page) {
      res.write('page not found: ' + pathname)
      res.end()
      return
    }
    res.write(page.html)
    res.write(script(socketPort))
    res.end()
  })

  try {
    const server = await app.listen(port)
    return server
  } catch (err) {
    console.log(err)
    throw err
  }
}

const script = (port: number) => `<script type='text/javascript'>
const socket = new WebSocket('ws://localhost:${port}')
socket.onmessage = msg => {
  const data = JSON.parse(msg.data)
  if (data.reload) {
    window.location.reload()
  }
}
</script>`

export { start }
