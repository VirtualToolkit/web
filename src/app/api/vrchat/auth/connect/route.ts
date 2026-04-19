import { VRChat } from "vrchat";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const cookieStore = new Map();
  const client = new VRChat({
    application: {
      name: "VirtualToolkit",
      version: "1.0.0",
      contact: "support@virtualtoolkit.app",
    },
    keyv: cookieStore,
  });

  try {
    const result = await client.getCurrentUser({
      credentials: "omit",
      headers: {
        authorization: `Basic ${btoa(`${encodeURIComponent(body.username)}:${encodeURIComponent(body.password)}`)}`,
      },
    });

    if (result.error) {
      return NextResponse.json({ error: "Invalid VRChat credentials" }, { status: 401 });
    }

    const data = result.data as Record<string, unknown>;

    if ("requiresTwoFactorAuth" in data) {
      session.pendingVrchatSession = [...cookieStore.entries()];
      await session.save();
      return NextResponse.json({
        status: "requires2fa",
        methods: data.requiresTwoFactorAuth,
      });
    }

    const cookieData = JSON.stringify([...cookieStore.entries()]);
    await prisma.vRChatUser.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        cookieData,
        vrcDisplayName: (data.displayName ?? null) as string | null,
      },
      update: { cookieData, vrcDisplayName: (data.displayName ?? null) as string | null },
    });

    return NextResponse.json({ status: "connected", displayName: data.displayName ?? null });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
