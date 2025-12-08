import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { BackgroundSettingsForm } from "@/components/BackgroundSettingsForm";

export default async function BackgroundSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      backgroundImage: true,
      backgroundOpacity: true,
    },
  });

  return (
    <LayoutWrapper>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LinguaType</p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">Background settings</h1>
        <p className="text-sm text-gray-500">Upload custom imagery and fine-tune the overlay to personalize your workspace.</p>
      </div>
      <BackgroundSettingsForm initialImageUrl={user?.backgroundImage ?? null} initialOpacity={user?.backgroundOpacity ?? 0.4} />
    </LayoutWrapper>
  );
}
