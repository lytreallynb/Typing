"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { PracticeItem } from "@/types/practice";

interface AddToCollectionButtonProps {
  item: PracticeItem | null;
}

export function AddToCollectionButton({ item }: AddToCollectionButtonProps) {
  const { status } = useSession();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  if (!item) return null;
  if (status === "unauthenticated") {
    return (
      <Button asChild variant="ghost" size="sm">
        <a href="/login">Log in to save</a>
      </Button>
    );
  }
  if (status !== "authenticated") return null;

  const handleAdd = async () => {
    setState("saving");
    const res = await fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, mode: item.mode }),
    });
    if (res.ok) {
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("idle");
    }
  };

  return (
    <Button variant="outline" size="sm" className="rounded-full" onClick={handleAdd} disabled={state === "saving"}>
      {state === "saved" ? "Saved!" : state === "saving" ? "Saving…" : "Add to collection"}
    </Button>
  );
}
