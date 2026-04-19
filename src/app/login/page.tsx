'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/providers/UserProvider'

export default function LoginPage() {
  const { login } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const password = form.get('password') as string

    try {
      await login(username, password)
      router.push(searchParams.get('next') ?? '/dashboard')
    } catch {
      setError('Invalid username or password')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-card border-border/60 flex w-full max-w-sm flex-col gap-4 rounded-xl border p-8 shadow-lg"
      >
        <h1 className="text-xl font-semibold">
          Virtual<span className="text-shy-moment">Toolkit</span>
        </h1>

        {error && (
          <p className="text-destructive rounded-md bg-red-500/10 px-3 py-2 text-sm">{error}</p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground text-sm" htmlFor="username">
            Username
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
            Password
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

        <button
          type="submit"
          disabled={pending}
          className="bg-shy-moment/90 hover:bg-shy-moment mt-1 rounded-md py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
