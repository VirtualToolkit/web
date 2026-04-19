import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "./session";
import { registerBrowserConnection, removeBrowserConnection } from "./browser-connections";
import { getState } from "./vrchat-state";
import { isDesktopConnected } from "./desktop-connections";
import { makeMessage } from "./desktop-protocol";

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key.trim(), decodeURIComponent(rest.join("="))];
    }),
  );
}

export async function handleBrowserConnection(ws: WebSocket, req: IncomingMessage) {
  const cookieHeader = req.headers.cookie ?? "";
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies[sessionOptions.cookieName];

  if (!sessionCookie) {
    ws.close(1008, "Unauthenticated");
    return;
  }

  let session: SessionData;
  try {
    session = await unsealData<SessionData>(sessionCookie, {
      password: sessionOptions.password as string,
    });
  } catch {
    ws.close(1008, "Unauthenticated");
    return;
  }

  if (!session.isLoggedIn || !session.user) {
    ws.close(1008, "Unauthenticated");
    return;
  }

  const { id: userId } = session.user;
  registerBrowserConnection(userId, ws);

  const state = getState(userId);
  const desktopOnline = isDesktopConnected(userId);

  if (desktopOnline) {
    ws.send(JSON.stringify(makeMessage("desktop_connected", {})));
  }

  for (const player of state.players) {
    ws.send(
      JSON.stringify(
        makeMessage("player_joined", {
          displayName: player.displayName,
          userId: player.userId,
        }),
      ),
    );
  }

  ws.on("close", () => removeBrowserConnection(userId, ws));
}
