import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json(null, { status: 401 })
  }

  return NextResponse.json(session.user)
}
