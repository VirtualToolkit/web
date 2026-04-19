import type { WebSocket } from "ws";
import type { OutgoingMessage } from "./desktop-protocol";

const g = globalThis as unknown as { _browserConns?: Map<string, Set<WebSocket>> };
const connections: Map<string, Set<WebSocket>> = g._browserConns ?? new Map();
if (process.env.NODE_ENV !== "production") g._browserConns = connections;

export function registerBrowserConnection(userId: string, ws: WebSocket) {
  if (!connections.has(userId)) connections.set(userId, new Set());
  connections.get(userId)!.add(ws);
}

export function removeBrowserConnection(userId: string, ws: WebSocket) {
  connections.get(userId)?.delete(ws);
  if (connections.get(userId)?.size === 0) connections.delete(userId);
}

export function broadcastToUser(userId: string, message: OutgoingMessage) {
  const sockets = connections.get(userId);
  if (!sockets) return;
  const payload = JSON.stringify(message);
  for (const ws of sockets) {
    if (ws.readyState === 1) ws.send(payload);
  }
}

export function hasBrowserConnection(userId: string): boolean {
  return (connections.get(userId)?.size ?? 0) > 0;
}
