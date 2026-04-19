import type { WebSocket } from 'ws'

// Survive Next.js HMR reloads in dev by storing on globalThis
const g = globalThis as unknown as { _desktopConns?: Map<string, WebSocket> }
const connections: Map<string, WebSocket> = g._desktopConns ?? new Map()
if (process.env.NODE_ENV !== 'production') g._desktopConns = connections

export function registerConnection(userId: string, ws: WebSocket) {
  connections.set(userId, ws)
}

export function removeConnection(userId: string) {
  connections.delete(userId)
}

export function isDesktopConnected(userId: string): boolean {
  const ws = connections.get(userId)
  return !!ws && ws.readyState === 1 // WebSocket.OPEN
}
