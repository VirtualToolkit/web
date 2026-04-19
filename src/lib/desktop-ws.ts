import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { parse } from "url";
import { prisma } from "./db";
import { registerConnection, removeConnection } from "./desktop-connections";
import { broadcastToUser } from "./browser-connections";
import { parseIncoming, makeMessage } from "./desktop-protocol";
import { addPlayer, removePlayer, setInstance, setAvatar, clearState } from "./vrchat-state";

export async function handleDesktopConnection(ws: WebSocket, req: IncomingMessage) {
  const authHeader = req.headers["authorization"];
  const { query } = parse(req.url!, true);
  const token = authHeader?.replace("Bearer ", "").trim() ?? (query.token as string | undefined);

  if (!token) {
    ws.close(1008, "Missing token");
    return;
  }

  const desktopToken = await prisma.desktopToken.findUnique({ where: { token } });

  if (!desktopToken) {
    ws.close(1008, "Invalid token");
    return;
  }

  const { userId } = desktopToken;
  registerConnection(userId, ws);
  broadcastToUser(userId, makeMessage("desktop_connected", {}));

  ws.on("message", (raw) => {
    const msg = parseIncoming(raw.toString());
    if (!msg) return;

    switch (msg.type) {
      case "heartbeat":
        break;

      case "hello":
        broadcastToUser(
          userId,
          makeMessage("desktop_connected", {
            version: msg.data.version,
            features: msg.data.features,
          }),
        );
        break;

      case "player_joined":
        addPlayer(userId, msg.data.displayName, msg.data.userId);
        broadcastToUser(userId, msg);
        break;

      case "player_left":
        removePlayer(userId, msg.data.displayName);
        broadcastToUser(userId, msg);
        break;

      case "instance_changed":
        setInstance(userId, msg.data);
        broadcastToUser(userId, msg);
        break;

      case "avatar_changed":
        setAvatar(userId, msg.data.avatarId, msg.data.avatarName);
        broadcastToUser(userId, msg);
        break;

      case "osc_parameter":
        broadcastToUser(userId, msg);
        break;

      case "chatbox":
        broadcastToUser(userId, msg);
        break;
    }
  });

  ws.on("close", () => {
    removeConnection(userId);
    clearState(userId);
    broadcastToUser(userId, makeMessage("desktop_disconnected", {}));
  });
}
