"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UserSettings {
  reduced_motion: boolean;
  low_bandwidth: boolean;
  accent_colour: string;
}

const defaults: UserSettings = {
  reduced_motion: false,
  low_bandwidth: false,
  accent_colour: "#a29bfe",
};

interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings({ ...defaults, ...data });
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--shy-moment", settings.accent_colour);
  }, [settings.accent_colour]);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings({ ...defaults, ...data });
    }
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, updateSettings, settingsOpen, openSettings, closeSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
