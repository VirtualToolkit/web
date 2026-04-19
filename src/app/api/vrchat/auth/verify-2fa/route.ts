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

  if (!session.pendingVrchatSession) {
    return NextResponse.json({ error: "No pending 2FA session" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.code || !body?.method) {
    return NextResponse.json({ error: "Code and method required" }, { status: 400 });
  }

  const cookieStore = new Map(session.pendingVrchatSession);
  const client = new VRChat({
    application: {
      name: "VirtualToolkit",
      version: "1.0.0",
      contact: "support@virtualtoolkit.app",
    },
    keyv: cookieStore,
    authentication: { optimistic: false },
  });

  try {
    let verified = false;

    if (body.method === "totp") {
      const result = await client.verify2Fa({ body: { code: body.code } });
      verified = result.data?.verified === true;
    } else if (body.method === "emailOtp") {
      const result = await client.verify2FaEmailCode({ body: { code: body.code } });
      verified = result.data?.verified === true;
    } else if (body.method === "otp") {
      const result = await client.verifyRecoveryCode({ body: { code: body.code } });
      verified = result.data?.verified === true;
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 401 });
    }

    const userResult = await client.getCurrentUser();
    const userData = userResult.data as Record<string, unknown> | null;
    const displayName =
      userData && !("requiresTwoFactorAuth" in userData)
        ? (userData.displayName as string | undefined)
        : undefined;

    const cookieData = JSON.stringify([...cookieStore.entries()]);
    await prisma.vRChatUser.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, cookieData, vrcDisplayName: displayName },
      update: { cookieData, vrcDisplayName: displayName },
    });

    session.pendingVrchatSession = undefined;
    await session.save();

    return NextResponse.json({ status: "connected", displayName });
  } catch {
    return NextResponse.json({ error: "2FA verification failed" }, { status: 500 });
  }
}
