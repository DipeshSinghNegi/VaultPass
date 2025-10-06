import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "Exists" }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });
  const token = signSession({ userId: String(user._id), email });
  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}


