"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { VRChatAuthModal } from "@/components/VRChatAuthModal";

interface VRChatAuthContextValue {
  isConnected: boolean;
  isLoading: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  openModal: () => void;
  disconnect: () => Promise<void>;
}

const VRChatAuthContext = createContext<VRChatAuthContextValue | null>(null);

export function VRChatAuthProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/vrchat/auth/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.connected) {
          setIsConnected(true);
          setDisplayName(data.displayName ?? null);
          setAvatarUrl(data.currentAvatarImageUrl ?? null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);

  const disconnect = useCallback(async () => {
    await fetch("/api/vrchat/auth/disconnect", { method: "POST" });
    setIsConnected(false);
    setDisplayName(null);
    setAvatarUrl(null);
  }, []);

  const handleConnected = useCallback((name: string | null) => {
    setIsConnected(true);
    setDisplayName(name);
    setModalOpen(false);
  }, []);

  return (
    <VRChatAuthContext.Provider
      value={{ isConnected, isLoading, displayName, avatarUrl, openModal, disconnect }}
    >
      {children}
      {modalOpen && (
        <VRChatAuthModal onConnected={handleConnected} onClose={() => setModalOpen(false)} />
      )}
    </VRChatAuthContext.Provider>
  );
}

export function useVRChatAuth(): VRChatAuthContextValue {
  const ctx = useContext(VRChatAuthContext);
  if (!ctx) throw new Error("useVRChatAuth must be used within <VRChatAuthProvider>");
  return ctx;
}
