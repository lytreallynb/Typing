import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "LinguaType · English Typing for Mandarin Speakers",
  description: "Dynamic typing practice that blends vocabulary, sentences, and immersive stats for Chinese learners of English.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const background = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          backgroundImage: true,
          backgroundOpacity: true,
        },
      })
    : null;

  const hasCustomBackground = Boolean(background?.backgroundImage);
  const resolvedOpacity = background?.backgroundOpacity ?? 0.4;

  return (
    <html lang="en" className="h-full">
      <body className="relative h-full font-sans antialiased bg-white text-gray-900 transition-colors dark:bg-gray-900 dark:text-gray-100">
        <div className="fixed inset-0 -z-20 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900" />
        {hasCustomBackground && (
          <div
            className="fixed inset-0 -z-10 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: `url(${background?.backgroundImage})`,
              opacity: resolvedOpacity,
            }}
          />
        )}
        <div className="pointer-events-none fixed inset-0 -z-[5] bg-black/10 dark:bg-black/40" />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
