import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { VaultItem } from "@/lib/models/VaultItem";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { encrypted, iv } = await req.json();
  await connectToDatabase();
  const item = await VaultItem.findOneAndUpdate(
    { _id: params.id, userId: session.userId },
    { encrypted, iv },
    { new: true }
  );
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  await VaultItem.deleteOne({ _id: params.id, userId: session.userId });
  return NextResponse.json({ ok: true });
}


