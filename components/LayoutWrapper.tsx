"use client";
import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LayoutWrapperProps extends PropsWithChildren {
  className?: string;
}

export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900", className)}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:py-14">{children}</div>
    </motion.main>
  );
}
