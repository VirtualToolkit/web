import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vrchatUser = await prisma.vRChatUser.findUnique({
    where: { userId: session.user.id },
    select: { vrcDisplayName: true },
  })

  if (!vrchatUser) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({ connected: true, displayName: vrchatUser.vrcDisplayName })
}
