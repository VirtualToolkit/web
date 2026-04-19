'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Gamepad2, KeyRound, Lock, Mail, RefreshCw, ShieldCheck, Unplug } from 'lucide-react'

type Stage = 'loading' | 'disconnected' | 'credentials' | 'twofa' | 'connected'

type TwoFaMethod = 'totp' | 'emailOtp' | 'otp'

const twoFaLabels: Record<TwoFaMethod, { label: string; icon: React.ReactNode; hint: string }> = {
  totp: {
    label: 'Authenticator App',
    icon: <ShieldCheck className="size-4" />,
    hint: 'Enter the 6-digit code from your authenticator app.',
  },
  emailOtp: {
    label: 'Email Code',
    icon: <Mail className="size-4" />,
    hint: 'Enter the code sent to your VRChat email address.',
  },
  otp: {
    label: 'Recovery Code',
    icon: <KeyRound className="size-4" />,
    hint: 'Enter one of your saved recovery codes.',
  },
}

export default function VRChatInstancePage() {
  const [stage, setStage] = useState<Stage>('loading')
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [twoFaMethods, setTwoFaMethods] = useState<TwoFaMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<TwoFaMethod>('totp')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    fetch('/api/vrchat/auth/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          setDisplayName(data.displayName ?? null)
          setStage('connected')
        } else {
          setStage('disconnected')
        }
      })
      .catch(() => setStage('disconnected'))
  }, [])

  async function handleConnect(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const password = form.get('password') as string

    try {
      const res = await fetch('/api/vrchat/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Authentication failed')
        return
      }

      if (data.status === 'requires2fa') {
        const methods: TwoFaMethod[] = data.methods ?? ['totp']
        setTwoFaMethods(methods)
        setSelectedMethod(methods[0])
        setStage('twofa')
        return
      }

      setDisplayName(data.displayName ?? null)
      setStage('connected')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function handleVerify2FA(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const code = form.get('code') as string

    try {
      const res = await fetch('/api/vrchat/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, method: selectedMethod }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Verification failed')
        return
      }

      setDisplayName(data.displayName ?? null)
      setStage('connected')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function handleDisconnect() {
    setPending(true)
    await fetch('/api/vrchat/auth/disconnect', { method: 'POST' })
    setDisplayName(null)
    setStage('disconnected')
    setPending(false)
  }

  if (stage === 'loading') {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (stage === 'connected') {
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
            <span className="text-sm font-medium">{displayName ?? 'Connected'}</span>
            <button
              onClick={handleDisconnect}
              disabled={pending}
              className="text-muted-foreground hover:text-destructive ml-1 transition-colors disabled:opacity-50"
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
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="border-border/60 bg-card w-full max-w-sm rounded-xl border shadow-lg">
        {stage === 'twofa' ? (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-5 p-8">
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="bg-shy-moment/15 text-shy-moment flex size-8 items-center justify-center rounded-lg">
                  <ShieldCheck className="size-4" />
                </div>
                <h1 className="font-semibold">Two-factor authentication</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Your VRChat account has 2FA enabled.
              </p>
            </div>

            {twoFaMethods.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Method
                </label>
                <div className="flex gap-1.5">
                  {twoFaMethods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setSelectedMethod(m); setError(null) }}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        selectedMethod === m
                          ? 'border-shy-moment bg-shy-moment/10 text-shy-moment'
                          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      {twoFaLabels[m].icon}
                      {twoFaLabels[m].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-sm" htmlFor="code">
                {twoFaLabels[selectedMethod].label}
              </label>
              <p className="text-muted-foreground -mt-0.5 text-xs">
                {twoFaLabels[selectedMethod].hint}
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
                className="border-border/60 bg-background focus:border-shy-moment mt-1 rounded-md border px-3 py-2 text-center font-mono text-sm tracking-widest outline-none transition-colors"
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
              {pending ? 'Verifying…' : 'Verify code'}
            </button>

            <button
              type="button"
              onClick={() => { setStage('credentials'); setError(null) }}
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
                className="border-border/60 bg-background focus:border-shy-moment rounded-md border px-3 py-2 text-sm outline-none transition-colors"
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
                className="border-border/60 bg-background focus:border-shy-moment rounded-md border px-3 py-2 text-sm outline-none transition-colors"
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
              {pending ? 'Connecting…' : 'Connect account'}
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
  )
}
