'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/providers/UserProvider'

export default function RegisterPage() {
  const { register } = useUser()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const password = form.get('password') as string
    const confirm = form.get('confirm') as string

    if (password !== confirm) {
      setError('Passwords do not match')
      setPending(false)
      return
    }

    try {
      await register(username, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
            minLength={3}
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
            minLength={8}
            autoComplete="new-password"
            className="border-border/60 bg-background focus:border-shy-moment rounded-md border px-3 py-2 text-sm outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground text-sm" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="border-border/60 bg-background focus:border-shy-moment rounded-md border px-3 py-2 text-sm outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-shy-moment/90 hover:bg-shy-moment mt-1 rounded-md py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-shy-moment hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
