"use client";

import { useEffect, useRef, useState } from "react";
import { X, Settings, Gamepad2 } from "lucide-react";
import { useSettings } from "@/providers/SettingsProvider";
import { useVRChatAuth } from "@/providers/VRChatAuthProvider";

type Page = "general" | "vrchat";

const pages: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Settings className="h-3.5 w-3.5" /> },
  { id: "vrchat", label: "VRChat", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-foreground text-sm font-medium">{label}</p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-shy-moment" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function GeneralPage() {
  const { settings, updateSettings } = useSettings();
  const [localColour, setLocalColour] = useState(settings.accent_colour);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalColour(settings.accent_colour);
  }, [settings.accent_colour]);

  function handleColourChange(value: string) {
    setLocalColour(value);
    document.documentElement.style.setProperty("--shy-moment", value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateSettings({ accent_colour: value }), 600);
  }

  return (
    <div className="space-y-1">
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        Appearance
      </h3>
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-foreground text-sm font-medium">Accent colour</p>
          <p className="text-muted-foreground text-xs">Used for highlights and active states</p>
        </div>
        <input
          type="color"
          value={localColour}
          onChange={(e) => handleColourChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </div>

      <div className="border-border/40 my-2 border-t" />
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        Accessibility
      </h3>
      <Toggle
        label="Reduced motion"
        description="Minimize animations throughout the app"
        checked={settings.reduced_motion}
        onChange={(v) => updateSettings({ reduced_motion: v })}
      />
      <Toggle
        label="Low bandwidth mode"
        description="Reduce data usage by limiting avatar image loads"
        checked={settings.low_bandwidth}
        onChange={(v) => updateSettings({ low_bandwidth: v })}
      />
    </div>
  );
}

function VRChatPage() {
  const { isConnected, displayName, openModal, disconnect } = useVRChatAuth();

  return (
    <div className="space-y-1">
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        Account
      </h3>
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-foreground text-sm font-medium">VRChat connection</p>
          <p className="text-muted-foreground text-xs">
            {isConnected ? `Connected as ${displayName}` : "Not connected"}
          </p>
        </div>
        {isConnected ? (
          <button
            onClick={disconnect}
            className="text-destructive hover:bg-destructive/10 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={openModal}
            className="bg-shy-moment/20 text-shy-moment hover:bg-shy-moment/30 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useSettings();
  const [page, setPage] = useState<Page>("general");

  if (!settingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={closeSettings}
    >
      <div
        className="bg-card border-border/60 flex h-[480px] w-full max-w-2xl overflow-hidden rounded-xl border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="bg-muted/40 border-border/40 flex w-44 shrink-0 flex-col border-r p-2">
          <p className="text-muted-foreground mb-2 px-2 pt-1 text-xs font-semibold tracking-wider uppercase">
            Settings
          </p>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                page === p.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </aside>

        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-base font-semibold">
              {pages.find((p) => p.id === page)?.label}
            </h2>
            <button
              onClick={closeSettings}
              className="text-muted-foreground hover:text-foreground rounded-sm transition-colors outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {page === "general" && <GeneralPage />}
          {page === "vrchat" && <VRChatPage />}
        </div>
      </div>
    </div>
  );
}
