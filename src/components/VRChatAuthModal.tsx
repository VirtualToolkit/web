"use client";

import { FormEvent, useState } from "react";
import { Gamepad2, Lock, ShieldCheck } from "lucide-react";

type Stage = "credentials" | "twofa";

interface VRChatAuthModalProps {
  onConnected: (displayName: string | null) => void;
  onClose: () => void;
}

export function VRChatAuthModal({ onConnected, onClose }: VRChatAuthModalProps) {
  const [stage, setStage] = useState<Stage>("credentials");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleConnect(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/vrchat/auth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Authentication failed");
        return;
      }

      if (data.status === "requires2fa") {
        setStage("twofa");
        return;
      }

      onConnected(data.displayName ?? null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleVerify2FA(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const code = form.get("code") as string;

    try {
      const res = await fetch("/api/vrchat/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method: "emailOtp" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed");
        return;
      }

      onConnected(data.displayName ?? null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="border-border/60 bg-card w-full max-w-sm rounded-xl border shadow-xl">
        {stage === "twofa" ? (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-5 p-8">
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="bg-shy-moment/15 text-shy-moment flex size-8 items-center justify-center rounded-lg">
                  <ShieldCheck className="size-4" />
                </div>
                <h1 className="font-semibold">Two-factor authentication</h1>
              </div>
              <p className="text-muted-foreground text-sm">Your VRChat account has 2FA enabled.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-sm" htmlFor="code">
                Email code
              </label>
              <p className="text-muted-foreground -mt-0.5 text-xs">
                Enter the code sent to your VRChat email address.
              </p>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                placeholder="000000"
                className="border-border/60 bg-background focus:border-shy-moment mt-1 rounded-md border px-3 py-2 text-center font-mono text-sm tracking-widest transition-colors outline-none"
              />
            </div>

            {error && (
              <p className="text-destructive rounded-md bg-red-500/10 px-3 py-2 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="bg-shy-moment/90 hover:bg-shy-moment rounded-md py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {pending ? "Verifying…" : "Verify code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStage("credentials");
                setError(null);
              }}
              className="text-muted-foreground hover:text-foreground -mt-1 text-center text-sm transition-colors"
            >
              ← Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleConnect} className="flex flex-col gap-5 p-8">
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="bg-shy-moment/15 text-shy-moment flex size-8 items-center justify-center rounded-lg">
                  <Gamepad2 className="size-4" />
                </div>
                <h1 className="font-semibold">Connect VRChat</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Link your VRChat account to use instance tools and more.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-sm" htmlFor="username">
                VRChat Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="border-border/60 bg-background focus:border-shy-moment rounded-md border px-3 py-2 text-sm transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-sm" htmlFor="password">
                VRChat Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="border-border/60 bg-background focus:border-shy-moment rounded-md border px-3 py-2 text-sm transition-colors outline-none"
              />
            </div>

            {error && (
              <p className="text-destructive rounded-md bg-red-500/10 px-3 py-2 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="bg-shy-moment/90 hover:bg-shy-moment mt-1 rounded-md py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {pending ? "Connecting…" : "Connect account"}
            </button>

            <div className="text-muted-foreground flex items-start gap-2 text-xs">
              <Lock className="mt-0.5 size-3 shrink-0" />
              <p>
                Your credentials are used only to create a VRChat session. We store the session
                cookie, not your password.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
