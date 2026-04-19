"use client";

import { RefreshCw, Unplug } from "lucide-react";
import { useVRChatAuth } from "@/providers/VRChatAuthProvider";

export default function VRChatInstancePage() {
  const { isConnected, isLoading, displayName, openModal, disconnect } = useVRChatAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-border/60 bg-card flex flex-col items-center gap-4 rounded-xl border p-8 text-center shadow-lg">
          <p className="text-muted-foreground text-sm">
            Connect your VRChat account to use instance tools.
          </p>
          <button
            onClick={openModal}
            className="bg-shy-moment/90 hover:bg-shy-moment rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Connect VRChat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Instance</h1>
          <p className="text-muted-foreground text-sm">Browse and manage VRChat instances.</p>
        </div>
        <div className="border-border/60 bg-card flex items-center gap-3 rounded-lg border px-3.5 py-2.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium">{displayName ?? "Connected"}</span>
          <button
            onClick={disconnect}
            className="text-muted-foreground hover:text-destructive ml-1 transition-colors"
            title="Disconnect"
          >
            <Unplug className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="border-border/60 bg-card rounded-xl border p-6">
        <p className="text-muted-foreground text-sm">Instance browser coming soon.</p>
      </div>
    </div>
  );
}
