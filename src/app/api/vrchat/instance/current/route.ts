import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getVRChatClient } from "@/lib/vrchat";

const NOT_IN_INSTANCE = new Set(["offline", "private", "traveling", ""]);

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getVRChatClient(session.user.id);
  if (!result) {
    return NextResponse.json({ error: "VRChat account not connected" }, { status: 403 });
  }

  const { client } = result;
  const meRes = await client.getCurrentUser();

  if (meRes.error) {
    return NextResponse.json({ error: "Failed to fetch current user" }, { status: 502 });
  }

  const presence = meRes.data && "presence" in meRes.data ? meRes.data.presence : undefined;
  const worldId = presence?.world;
  const instanceId = presence?.instance;

  if (!worldId || !instanceId || NOT_IN_INSTANCE.has(worldId) || NOT_IN_INSTANCE.has(instanceId)) {
    return NextResponse.json({ error: "Not currently in an instance" }, { status: 404 });
  }

  const instanceRes = await client.getInstance({ path: { worldId, instanceId } });

  if (instanceRes.error) {
    return NextResponse.json({ error: "Failed to fetch instance" }, { status: 502 });
  }

  const d = instanceRes.data;
  return NextResponse.json({
    name: d.name,
    type: d.type,
    region: d.region,
    n_users: d.n_users,
    capacity: d.capacity ?? d.world.capacity,
    full: d.full,
    ownerId: d.ownerId ?? null,
    tags: d.tags,
    platforms: d.platforms,
    users:
      d.users?.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        thumbnailUrl: u.currentAvatarThumbnailImageUrl,
        platform: u.platform ?? u.last_platform,
        status: u.status,
        isFriend: u.isFriend,
      })) ?? null,
    world: {
      name: d.world.name,
      description: d.world.description,
      authorName: d.world.authorName,
      thumbnailImageUrl: d.world.thumbnailImageUrl,
    },
  });
}
