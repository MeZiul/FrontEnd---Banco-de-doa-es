"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BotaoVoltar() {
    const router = useRouter();

    function voltar() {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.push("/");
    }

    return (
        <button
            type="button"
            onClick={voltar}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
        </button>
    );
}