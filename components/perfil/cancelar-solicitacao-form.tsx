"use client";

import { useState, useTransition } from "react";
import { cancelarSolicitacao } from "@/app/(protected)/perfil/minhas-solicitacoes/actions";

export function CancelarSolicitacaoForm({
    interesseId
}: {
    interesseId: string;
}) {
    const [pendente, iniciarCancelamento] = useTransition();

    const [resultado, setResultado] = useState<{
        sucesso: boolean;
        mensagem: string;
    } | null>(null);

    function cancelar() {
        const confirmado = window.confirm("Tem certeza de que deseja cancelar esta solicitação?");

        if (!confirmado) return;

        setResultado(null);

        iniciarCancelamento(async () => {
            const resposta = await cancelarSolicitacao(interesseId);
            setResultado(resposta);
        });
    }

    return (
        <div aria-busy={pendente} className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={cancelar}
                disabled={pendente || resultado?.sucesso}
                className="inline-flex items-center rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pendente ? "Cancelando solicitação..." : "Cancelar solicitação"}
            </button>

            {resultado?.mensagem && (
                <p
                    role={resultado.sucesso ? "status" : "alert"}
                    className={
                        resultado.sucesso
                            ? "text-sm text-emerald-700"
                            : "text-sm text-red-700"
                    }
                >
                    {resultado.mensagem}
                </p>
            )}
        </div>
    );
}
