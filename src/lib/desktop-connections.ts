import type { WebSocket } from "ws";

const g = globalThis as unknown as {
  _desktopConns?: Map<string, WebSocket>;
  _desktopSimulated?: Set<string>;
};
const connections: Map<string, WebSocket> = g._desktopConns ?? new Map();
const simulated: Set<string> = g._desktopSimulated ?? new Set();
if (process.env.NODE_ENV !== "production") {
  g._desktopConns = connections;
  g._desktopSimulated = simulated;
}

export function registerConnection(userId: string, ws: WebSocket) {
  connections.set(userId, ws);
}

export function removeConnection(userId: string) {
  connections.delete(userId);
}

export function isDesktopConnected(userId: string): boolean {
  if (simulated.has(userId)) return true;
  const ws = connections.get(userId);
  return !!ws && ws.readyState === 1;
}

export function registerSimulatedConnection(userId: string) {
  simulated.add(userId);
}

export function removeSimulatedConnection(userId: string) {
  simulated.delete(userId);
}
