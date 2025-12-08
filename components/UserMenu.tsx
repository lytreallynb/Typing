"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { status, data } = useSession();

  if (status === "loading") {
    return <div className="text-xs text-gray-400">Loading…</div>;
  }

  if (status === "unauthenticated") {
    return (
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href="/login">Log in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">Hi, {data?.user?.name || "Learner"}</span>
      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign out
      </Button>
    </div>
  );
}
