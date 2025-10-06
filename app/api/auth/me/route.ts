import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export async function GET() {
  const session = getSessionFromRequest();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  await connectToDatabase();
  const user = await User.findById(session.userId).select("_id email");
  return NextResponse.json({ user });
}


