import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { updateCollectionPerformance } from "@/lib/collectionService";

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  await prisma.collectionItem.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const payload = await request.json();
  const item = await prisma.collectionItem.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await updateCollectionPerformance(item, Boolean(payload.wasCorrect));
  return NextResponse.json({ item: updated });
}
