"use client";

import { useVRChatAuth } from "@/providers/VRChatAuthProvider";

export default function VRChatGate({ children }: { children: React.ReactNode }) {
  const { isConnected, isLoading, openModal } = useVRChatAuth();

  if (isLoading) return null;

  if (!isConnected) {
    return (
      <div className="border-border/60 bg-card hover:bg-muted/40 gap-3 rounded-xl border p-4 transition-colors">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Link your VRChat account to see this.</p>
          <button
            onClick={openModal}
            className="text-shy-moment mt-2 text-xs underline-offset-2 hover:underline"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
