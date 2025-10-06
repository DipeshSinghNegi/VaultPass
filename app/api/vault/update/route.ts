import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { VaultItem } from "@/lib/models/VaultItem";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, encrypted, iv } = await req.json();
  await connectToDatabase();
  const item = await VaultItem.findOneAndUpdate(
    { _id: id, userId: session.userId },
    { encrypted, iv },
    { new: true }
  );
  return NextResponse.json({ item });
}


