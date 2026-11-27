"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BotaoVoltar() {
  const router = useRouter();

  function voltar() {
    if (
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin &&
      window.history.length > 1
    ) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={voltar}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Voltar
    </button>
  );
}