import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.vRChatUser.deleteMany({ where: { userId: session.user.id } })

  return NextResponse.json({ status: 'disconnected' })
}
