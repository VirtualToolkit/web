import type { WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import { parse } from 'url'
import { prisma } from './db'
import { registerConnection, removeConnection } from './desktop-connections'

export async function handleDesktopConnection(ws: WebSocket, req: IncomingMessage) {
  const authHeader = req.headers['authorization']
  const { query } = parse(req.url!, true)
  const token = authHeader?.replace('Bearer ', '').trim() ?? (query.token as string | undefined)

  if (!token) {
    ws.close(1008, 'Missing token')
    return
  }

  const desktopToken = await prisma.desktopToken.findUnique({ where: { token } })

  if (!desktopToken) {
    ws.close(1008, 'Invalid token')
    return
  }

  registerConnection(desktopToken.userId, ws)

  ws.on('close', () => removeConnection(desktopToken.userId))

  // Future: handle messages from the desktop exe
  ws.on('message', (_data) => {})
}
