import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export type SessionPayload = { userId: string; email: string };

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function setSessionCookie(token: string) {
  cookies().set("lc_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie() {
  cookies().set("lc_token", "", { path: "/", maxAge: 0 });
}

export function getSessionFromRequest(req?: NextRequest): SessionPayload | null {
  try {
    const token = req ? req.cookies.get("lc_token")?.value : cookies().get("lc_token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}


