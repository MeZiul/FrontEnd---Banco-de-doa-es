"use client";

import { useActionState } from "react";
import { confirmarRecebimento } from "@/app/(protected)/perfil/minhas-solicitacoes/actions";

export function ConfirmarRecebimentoForm({ interesseId }: { interesseId: string }) {
  const [resultado, action, pendente] = useActionState(confirmarRecebimento, {
    sucesso: false,
    mensagem: "",
  });

  return (
    <form action={action} aria-busy={pendente} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="interesseId" value={interesseId} />
      <button
        type="submit"
        disabled={pendente}
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
      >
        {pendente ? "Confirmando recebimento…" : "Confirmar que recebi"}
      </button>
      {resultado.mensagem && (
        <p
          role={resultado.sucesso ? "status" : "alert"}
          className={resultado.sucesso ? "text-sm text-emerald-700" : "text-sm text-red-700"}
        >
          {resultado.mensagem}
        </p>
      )}
    </form>
  );
}
