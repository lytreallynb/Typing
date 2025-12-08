"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Unable to register.");
        }
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LinguaType</p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm text-gray-500">{mode === "login" ? "Sign in to sync your progress & collection book." : "Start saving your personalized practice history."}</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="block text-sm">
              <span className="text-gray-600 dark:text-gray-300">Name</span>
              <input name="name" type="text" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Li Hua" />
            </label>
          )}
          <label className="block text-sm">
            <span className="text-gray-600 dark:text-gray-300">Email</span>
            <input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800" placeholder="you@example.com" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600 dark:text-gray-300">Password</span>
            <input name="password" type="password" required className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800" placeholder="••••••••" />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <button className="text-indigo-600" onClick={() => setMode("signup")}>
              Need an account? Sign up
            </button>
          ) : (
            <button className="text-indigo-600" onClick={() => setMode("login")}>
              Already have an account? Log in
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
