import type { SessionOptions } from "iron-session";

export interface SessionUser {
  id: string;
  username: string;
}

export interface SessionData {
  user?: SessionUser;
  isLoggedIn: boolean;
  pendingVrchatSession?: [string, unknown][];
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "change-me-to-a-32-char-secret-key!!",
  cookieName: "vrt-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};
