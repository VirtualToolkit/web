"use client";

import { useState } from "react";
import { Bug, X, ChevronDown, ChevronUp, Send } from "lucide-react";

type EventTab =
  | "connection"
  | "player_joined"
  | "player_left"
  | "instance_changed"
  | "avatar_changed"
  | "osc_parameter"
  | "chatbox";

async function simulate(type: string, data: Record<string, unknown> = {}) {
  const res = await fetch("/api/dev/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export default function DevPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<EventTab>("connection");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [playerName, setPlayerName] = useState("TestUser");
  const [playerId, setPlayerId] = useState("");

  const [worldId, setWorldId] = useState("wrld_00000000-0000-0000-0000-000000000000");
  const [instanceId, setInstanceId] = useState("12345~public(usr_sim)");
  const [worldName, setWorldName] = useState("Test World");
  const [instanceType, setInstanceType] = useState("public");

  const [avatarId, setAvatarId] = useState("avtr_00000000-0000-0000-0000-000000000000");
  const [avatarName, setAvatarName] = useState("Test Avatar");

  const [oscParam, setOscParam] = useState("VRCFaceBlendV");
  const [oscValue, setOscValue] = useState("0.5");

  const [chatText, setChatText] = useState("Hello from the simulator!");
  const [chatTyping, setChatTyping] = useState(false);

  async function send(type: string, data: Record<string, unknown> = {}) {
    setStatus(null);
    setError(null);
    try {
      await simulate(type, data);
      setStatus(`Sent: ${type}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  const tabs: { id: EventTab; label: string }[] = [
    { id: "connection", label: "Connection" },
    { id: "player_joined", label: "Player Join" },
    { id: "player_left", label: "Player Left" },
    { id: "instance_changed", label: "Instance" },
    { id: "avatar_changed", label: "Avatar" },
    { id: "osc_parameter", label: "OSC" },
    { id: "chatbox", label: "Chatbox" },
  ];

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-card border-border w-80 rounded-lg border shadow-xl">
          <div className="border-border flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2">
              <Bug className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-semibold">WS Simulator</span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
            </button>
          </div>

          <div className="border-border flex flex-wrap gap-1 border-b p-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-3">
            {tab === "connection" && (
              <div className="flex gap-2">
                <button
                  onClick={() => send("desktop_connect")}
                  className="flex-1 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500"
                >
                  Connect Desktop
                </button>
                <button
                  onClick={() => send("desktop_disconnect")}
                  className="flex-1 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                  Disconnect
                </button>
              </div>
            )}

            {(tab === "player_joined" || tab === "player_left") && (
              <>
                <Field label="Display Name" value={playerName} onChange={setPlayerName} />
                {tab === "player_joined" && (
                  <Field
                    label="User ID (optional)"
                    value={playerId}
                    onChange={setPlayerId}
                    placeholder="usr_..."
                  />
                )}
                <SendButton
                  onClick={() =>
                    send(tab, {
                      displayName: playerName,
                      ...(tab === "player_joined" && playerId ? { userId: playerId } : {}),
                    })
                  }
                />
              </>
            )}

            {tab === "instance_changed" && (
              <>
                <Field label="World ID" value={worldId} onChange={setWorldId} />
                <Field label="Instance ID" value={instanceId} onChange={setInstanceId} />
                <Field label="World Name" value={worldName} onChange={setWorldName} />
                <Field
                  label="Instance Type"
                  value={instanceType}
                  onChange={setInstanceType}
                  placeholder="public / friends / private"
                />
                <SendButton
                  onClick={() =>
                    send("instance_changed", { worldId, instanceId, worldName, instanceType })
                  }
                />
              </>
            )}

            {tab === "avatar_changed" && (
              <>
                <Field label="Avatar ID" value={avatarId} onChange={setAvatarId} />
                <Field label="Avatar Name" value={avatarName} onChange={setAvatarName} />
                <SendButton onClick={() => send("avatar_changed", { avatarId, avatarName })} />
              </>
            )}

            {tab === "osc_parameter" && (
              <>
                <Field label="Parameter" value={oscParam} onChange={setOscParam} />
                <Field
                  label="Value"
                  value={oscValue}
                  onChange={setOscValue}
                  placeholder="number, true/false, or string"
                />
                <SendButton
                  onClick={() => {
                    let value: string | number | boolean = oscValue;
                    if (value === "true") value = true;
                    else if (value === "false") value = false;
                    else if (!isNaN(Number(value))) value = Number(value);
                    send("osc_parameter", { parameter: oscParam, value });
                  }}
                />
              </>
            )}

            {tab === "chatbox" && (
              <>
                <Field label="Text" value={chatText} onChange={setChatText} />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={chatTyping}
                    onChange={(e) => setChatTyping(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-muted-foreground">Typing indicator</span>
                </label>
                <SendButton
                  onClick={() => send("chatbox", { text: chatText, typing: chatTyping })}
                />
              </>
            )}

            {status && <p className="text-xs text-green-500">{status}</p>}
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
        title="WS Simulator"
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <Bug className="h-5 w-5" />}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-xs">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-border bg-background focus:ring-primary w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none"
      />
    </div>
  );
}

function SendButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium"
    >
      <Send className="h-3.5 w-3.5" />
      Send Event
    </button>
  );
}
