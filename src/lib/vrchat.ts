import { VRChat } from 'vrchat'
import { prisma } from '@/lib/db'

const APP_CONFIG = {
  application: {
    name: 'VirtualToolkit',
    version: '1.0.0',
    contact: 'support@virtualtoolkit.app',
  },
} as const

/**
 * Returns an authenticated VRChat client for the given user, or null if they
 * have no linked VRChat account. Use this in API routes to call the VRChat API
 * on behalf of the user.
 *
 * The client's keyv store is backed by the cookie data saved in the database.
 * Any cookie refreshes that occur during the request are NOT automatically
 * persisted — call `saveVRChatClient(userId, cookieStore)` after your request
 * if you need to persist updated cookies.
 */
export async function getVRChatClient(
  userId: string,
): Promise<{ client: VRChat; cookieStore: Map<string, unknown> } | null> {
  const vrchatUser = await prisma.vRChatUser.findUnique({
    where: { userId },
    select: { cookieData: true },
  })

  if (!vrchatUser) return null

  const cookieStore = new Map<string, unknown>(JSON.parse(vrchatUser.cookieData))
  const client = new VRChat({
    ...APP_CONFIG,
    keyv: cookieStore,
  })

  return { client, cookieStore }
}

export async function saveVRChatClient(
  userId: string,
  cookieStore: Map<string, unknown>,
): Promise<void> {
  await prisma.vRChatUser.update({
    where: { userId },
    data: { cookieData: JSON.stringify([...cookieStore.entries()]) },
  })
}
