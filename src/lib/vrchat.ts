import { VRChat } from 'vrchat'
import { prisma } from '@/lib/db'

const APP_CONFIG = {
  application: {
    name: 'VirtualToolkit',
    version: '1.0.0',
    contact: 'support@virtualtoolkit.app',
  },
} as const

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
