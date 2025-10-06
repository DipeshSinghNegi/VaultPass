import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    if (!email || !password) return NextResponse.json({ error: "Missing TEST_USER envs" }, { status: 400 });
    await connectToDatabase();
    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 12);
      user = await User.create({ email, passwordHash });
    }
    return NextResponse.json({ ok: true, email });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown" }, { status: 500 });
  }
}


