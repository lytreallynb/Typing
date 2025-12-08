import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { CollectionList } from "@/components/CollectionList";

export default async function CollectionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const items = await prisma.collectionItem.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = items.map((item) => ({
    id: item.id,
    word: item.word,
    translation: item.translation,
    difficulty: item.difficulty,
    mode: item.mode,
    lastSeen: item.lastSeen?.toISOString() ?? null,
    nextReviewDate: item.nextReviewDate?.toISOString() ?? null,
    seenCount: item.seenCount,
    correctRate: item.correctRate,
  }));

  return (
    <LayoutWrapper>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LinguaType</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">Collection book</h1>
          <p className="text-sm text-gray-500">Your saved vocabulary & sentences with review schedule.</p>
        </div>
      </div>
      <CollectionList initialItems={serialized} />
    </LayoutWrapper>
  );
}
