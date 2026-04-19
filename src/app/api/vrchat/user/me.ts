import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getVRChatClient } from '@/lib/vrchat'

export async function GET(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getVRChatClient(session.user.id)
  if (!result) {
    return NextResponse.json({ error: 'VRChat account not connected' }, { status: 403 })
  }

  const { client } = result
  const res = await client.getCurrentUser();

  if (res.error) {
    return NextResponse.json({ error: 'Failed to fetch current user' }, { status: 502 })
  }

  return NextResponse.json(res.data ?? [])
}
