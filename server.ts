import 'dotenv/config'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'
import { handleDesktopConnection } from './src/lib/desktop-ws'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT ?? '3000', 10)
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const upgradeHandler = app.getUpgradeHandler()

  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url!, true))
  })

  const wss = new WebSocketServer({ noServer: true })

  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url!)
    if (pathname === '/ws/desktop') {
      wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
    } else {
      upgradeHandler(req, socket, head)
    }
  })

  wss.on('connection', handleDesktopConnection)

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
