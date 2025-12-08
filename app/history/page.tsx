import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { HistoryList } from "@/components/HistoryList";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [histories, profile] = await Promise.all([
    prisma.practiceHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
  ]);

  const serializedHistories = histories.map((history) => ({
    ...history,
    createdAt: history.createdAt.toISOString(),
  }));

  const profileSnapshot = profile
    ? {
        totalPracticeTime: profile.totalPracticeTime,
        totalWordsTyped: profile.totalWordsTyped,
        averageWPM: profile.averageWPM,
        accuracyStats: profile.accuracyStats,
      }
    : null;

  return (
    <LayoutWrapper>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LinguaType</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">Practice history</h1>
          <p className="text-sm text-gray-500">Review how your speed and accuracy evolve over time.</p>
        </div>
      </div>
      <HistoryList histories={serializedHistories} profile={profileSnapshot} />
    </LayoutWrapper>
  );
}
