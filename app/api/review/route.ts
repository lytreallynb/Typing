import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const now = new Date();
  const items = await prisma.collectionItem.findMany({
    where: {
      userId: session.user.id,
      OR: [{ nextReviewDate: null }, { nextReviewDate: { lte: now } }],
    },
    orderBy: { nextReviewDate: "asc" },
    take: limit,
  });
  return NextResponse.json({ items });
}
