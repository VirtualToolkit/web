import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// Short-lived OTPs: token -> { userId, expiresAt }
const otps = new Map<string, { userId: string; expiresAt: number }>()

// Web app calls this to generate a pairing OTP
export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const otp = crypto.randomBytes(32).toString('hex')
  otps.set(otp, { userId: session.user.id, expiresAt: Date.now() + 5 * 60 * 1000 })

  return NextResponse.json({ token: otp })
}

// Desktop exe calls this to exchange the OTP for a long-lived token
export async function PUT(req: Request) {
  const { token } = await req.json()
  const otp = otps.get(token)

  if (!otp || otp.expiresAt < Date.now()) {
    otps.delete(token)
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  otps.delete(token)

  const longLivedToken = crypto.randomBytes(32).toString('hex')

  await prisma.desktopToken.upsert({
    where: { userId: otp.userId },
    update: { token: longLivedToken },
    create: { userId: otp.userId, token: longLivedToken },
  })

  return NextResponse.json({ token: longLivedToken })
}
