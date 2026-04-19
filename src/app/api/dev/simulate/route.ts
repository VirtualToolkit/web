import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { broadcastToUser } from "@/lib/browser-connections";
import { makeMessage } from "@/lib/desktop-protocol";
import { registerSimulatedConnection, removeSimulatedConnection } from "@/lib/desktop-connections";

if (process.env.NODE_ENV === "production") {
  // This route is dev-only
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json();
  const { type, data } = body as { type: string; data: Record<string, unknown> };

  switch (type) {
    case "desktop_connect":
      registerSimulatedConnection(userId);
      broadcastToUser(
        userId,
        makeMessage("desktop_connected", { version: "sim-1.0", features: ["simulation"] }),
      );
      break;

    case "desktop_disconnect":
      removeSimulatedConnection(userId);
      broadcastToUser(userId, makeMessage("desktop_disconnected", {}));
      break;

    case "player_joined": {
      const displayName = String(data.displayName ?? "TestUser");
      const playerId = data.userId ? String(data.userId) : undefined;
      broadcastToUser(userId, makeMessage("player_joined", { displayName, userId: playerId }));
      break;
    }

    case "player_left": {
      const displayName = String(data.displayName ?? "TestUser");
      broadcastToUser(userId, makeMessage("player_left", { displayName }));
      break;
    }

    case "instance_changed": {
      const info = {
        worldId: String(data.worldId ?? "wrld_00000000-0000-0000-0000-000000000000"),
        instanceId: String(data.instanceId ?? "12345~public(usr_sim)"),
        worldName: data.worldName ? String(data.worldName) : undefined,
        instanceType: data.instanceType ? String(data.instanceType) : undefined,
      };
      broadcastToUser(userId, makeMessage("instance_changed", info));
      break;
    }

    case "avatar_changed": {
      const avatarId = String(data.avatarId ?? "avtr_00000000-0000-0000-0000-000000000000");
      const avatarName = data.avatarName ? String(data.avatarName) : undefined;
      broadcastToUser(userId, makeMessage("avatar_changed", { avatarId, avatarName }));
      break;
    }

    case "osc_parameter": {
      const raw = data.value ?? 0;
      const value: string | number | boolean =
        typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean"
          ? raw
          : Number(raw);
      broadcastToUser(
        userId,
        makeMessage("osc_parameter", {
          parameter: String(data.parameter ?? "VRCFaceBlendV"),
          value,
        }),
      );
      break;
    }

    case "chatbox": {
      broadcastToUser(
        userId,
        makeMessage("chatbox", {
          text: String(data.text ?? ""),
          typing: Boolean(data.typing),
        }),
      );
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
