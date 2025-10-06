import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = signSession({ userId: String(user._id), email });
  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}


