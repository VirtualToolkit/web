import { unsealData } from 'iron-session'
import { type NextRequest, NextResponse } from 'next/server'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(sessionOptions.cookieName)?.value

  if (!cookie) {
    return NextResponse.json(null, { status: 401 })
  }

  try {
    const session = await unsealData<SessionData>(cookie, { password: sessionOptions.password as string })
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(null, { status: 401 })
    }
    return NextResponse.json(session.user)
  } catch {
    return NextResponse.json(null, { status: 401 })
  }
}
