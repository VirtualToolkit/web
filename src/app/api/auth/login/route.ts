import { sealData } from 'iron-session'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body?.username || !body?.password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    let user
    try {
      user = await prisma.user.findUnique({ where: { username: body.username } })
    } catch (dbErr) {
      console.error('[login] DB error:', dbErr)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!user || !verifyPassword(body.password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const sessionData: SessionData = {
      user: { id: user.id, username: user.username },
      isLoggedIn: true,
    }

    let sealed: string
    try {
      sealed = await sealData(sessionData, { password: sessionOptions.password as string })
    } catch (sealErr) {
      console.error('[login] sealData error:', sealErr)
      return NextResponse.json({ error: 'Session error' }, { status: 500 })
    }

    const response = NextResponse.json({ id: user.id, username: user.username })
    response.cookies.set(sessionOptions.cookieName, sealed, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[login] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
