import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ histories: [] });
  }
  const histories = await prisma.practiceHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return NextResponse.json({ histories });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await request.json();

  const history = await prisma.practiceHistory.create({
    data: {
      userId: session.user.id,
      mode: payload.mode,
      difficulty: payload.difficulty,
      itemsAttempted: payload.itemsAttempted,
      wpm: payload.wpm,
      accuracy: payload.accuracy,
      durationMs: payload.durationMs,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
    },
  });

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      totalPracticeTime: { increment: payload.durationMs ?? 0 },
      totalWordsTyped: { increment: payload.itemsAttempted ?? 0 },
      averageWPM: payload.wpm,
      accuracyStats: payload.accuracy,
      difficultyPreference: payload.difficulty,
      lastActiveDate: new Date(),
    },
  });

  return NextResponse.json({ history });
}
