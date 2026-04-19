import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.username || !body?.password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { username: body.username } })

  if (!user || !verifyPassword(body.password, user.password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.user = { id: user.id, username: user.username }
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ id: user.id, username: user.username })
}
