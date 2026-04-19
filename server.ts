import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer } from "ws";
import { handleDesktopConnection } from "./src/lib/desktop-ws";
import { handleBrowserConnection } from "./src/lib/browser-ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const upgradeHandler = app.getUpgradeHandler();

  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  const desktopWss = new WebSocketServer({ noServer: true });
  const browserWss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url!);
    if (pathname === "/ws/desktop") {
      desktopWss.handleUpgrade(req, socket, head, (ws) => desktopWss.emit("connection", ws, req));
    } else if (pathname === "/ws/browser") {
      browserWss.handleUpgrade(req, socket, head, (ws) => browserWss.emit("connection", ws, req));
    } else {
      upgradeHandler(req, socket, head);
    }
  });

  desktopWss.on("connection", handleDesktopConnection);
  browserWss.on("connection", handleBrowserConnection);

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
