import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { VaultItem } from "@/lib/models/VaultItem";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { encrypted, iv } = await req.json();
  if (!encrypted || !iv) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await connectToDatabase();
  const item = await VaultItem.create({ userId: session.userId, encrypted, iv });
  return NextResponse.json({ item });
}


