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
    select: { vrcDisplayName: true, cookieData: true },
  })

  if (!vrchatUser) {
    return NextResponse.json({ connected: false })
  }

  let currentAvatarImageUrl: string | null = null
  try {
    const { VRChat } = await import('vrchat')
    const cookieStore = new Map(JSON.parse(vrchatUser.cookieData))
    const client = new VRChat({
      application: { name: 'VirtualToolkit', version: '1.0.0', contact: 'support@virtualtoolkit.app' },
      keyv: cookieStore,
    })
    const result = await client.getCurrentUser()
    const data = result.data as Record<string, unknown> | null
    if (data && !('requiresTwoFactorAuth' in data)) {
      currentAvatarImageUrl = (data.currentAvatarImageUrl as string) ?? null
    }
  } catch {
    // non-fatal — avatar URL is best-effort
  }

  return NextResponse.json({
    connected: true,
    displayName: vrchatUser.vrcDisplayName,
    currentAvatarImageUrl,
  })
}
