import { NextResponse } from 'next/server'
import { sessionOptions } from '@/lib/session'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(sessionOptions.cookieName)
  return response
}
