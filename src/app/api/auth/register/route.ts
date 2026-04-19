import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.username || !body?.password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  if (body.username.length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
  }

  if (body.password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username: body.username } })
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { username: body.username, password: hashPassword(body.password) },
  })

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.user = { id: user.id, username: user.username }
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 })
}
