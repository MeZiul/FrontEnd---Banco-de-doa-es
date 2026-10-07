"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function FeedRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())} className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Tentando novamente…" : "Tentar novamente"}</button>;
}
