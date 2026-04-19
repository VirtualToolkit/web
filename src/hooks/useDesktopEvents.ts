"use client";

import { useEffect, useRef, useState } from "react";
import type { OutgoingMessage } from "@/lib/desktop-protocol";

export interface DesktopPlayer {
  displayName: string;
  userId?: string;
  joinedAt: number;
}

export interface DesktopEventEntry {
  type: "player_joined" | "player_left" | "instance_changed" | "avatar_changed";
  displayName?: string;
  detail?: string;
  ts: number;
}

export interface DesktopState {
  connected: boolean;
  players: DesktopPlayer[];
  recentEvents: DesktopEventEntry[];
  avatar: { avatarId: string; avatarName?: string } | null;
}

const MAX_EVENTS = 50;

export function useDesktopEvents(): DesktopState {
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<DesktopPlayer[]>([]);
  const [recentEvents, setRecentEvents] = useState<DesktopEventEntry[]>([]);
  const [avatar, setAvatar] = useState<{ avatarId: string; avatarName?: string } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/browser`);
    wsRef.current = ws;

    function pushEvent(entry: DesktopEventEntry) {
      setRecentEvents((prev) => [entry, ...prev].slice(0, MAX_EVENTS));
    }

    ws.onmessage = (event) => {
      let msg: OutgoingMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "desktop_connected":
          setConnected(true);
          break;

        case "desktop_disconnected":
          setConnected(false);
          setPlayers([]);
          break;

        case "player_joined":
          setPlayers((prev) => {
            if (prev.some((p) => p.displayName === msg.data.displayName)) return prev;
            return [...prev, { ...msg.data, joinedAt: msg.ts }];
          });
          pushEvent({ type: "player_joined", displayName: msg.data.displayName, ts: msg.ts });
          break;

        case "player_left":
          setPlayers((prev) => prev.filter((p) => p.displayName !== msg.data.displayName));
          pushEvent({ type: "player_left", displayName: msg.data.displayName, ts: msg.ts });
          break;

        case "instance_changed":
          setPlayers([]);
          pushEvent({
            type: "instance_changed",
            detail: msg.data.worldName ?? `${msg.data.worldId}:${msg.data.instanceId}`,
            ts: msg.ts,
          });
          break;

        case "avatar_changed":
          setAvatar({ avatarId: msg.data.avatarId, avatarName: msg.data.avatarName });
          pushEvent({
            type: "avatar_changed",
            detail: msg.data.avatarName ?? msg.data.avatarId,
            ts: msg.ts,
          });
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  return { connected, players, recentEvents, avatar };
}
