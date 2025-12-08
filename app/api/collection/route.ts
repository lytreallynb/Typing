import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createCollectionItem, listCollectionItems } from "@/lib/collectionService";
import type { PracticeMode } from "@/types/practice";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await listCollectionItems(session.user.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await request.json();
  const item = await createCollectionItem(session.user.id, payload.item, payload.mode as PracticeMode);
  return NextResponse.json({ item });
}
