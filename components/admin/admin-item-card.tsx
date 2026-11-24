"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { cancelarItemAdmin, type AdminItem } from "@/app/(protected)/admin/itens/actions";
import { STATUS_ITEM } from "@/lib/status-item";

// Fuso fixo para o servidor e o navegador mostrarem a mesma data.
const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });
const botao = "rounded-lg border px-4 py-2 text-sm disabled:opacity-50";

export function AdminItemCard({ item }: { item: AdminItem }) {
  const [aberto, setAberto] = useState(false);
  const [resultado, cancelar, pendente] = useActionState(cancelarItemAdmin, { sucesso: false, mensagem: "" });
  const status = STATUS_ITEM[item.status] ?? { nome: item.status, classe: "bg-gray-100 text-gray-700" };
  const cancelavel = item.status !== "CANCELADO" && item.status !== "DOADO";
  const campoMotivo = `motivo-${item._id}`;

  return (
    <li className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="break-words font-semibold">
            {item.status === "CANCELADO" ? item.titulo : <Link href={`/doacoes/${item._id}`} className="underline-offset-4 hover:underline">{item.titulo}</Link>}
          </h2>
          <p className="break-words text-sm text-slate-600">
            {item.usuario_id ? `${item.usuario_id.nome} · ${item.usuario_id.email}` : "Doador não encontrado"}
          </p>
          <p className="text-xs text-slate-500">
            {item.categoria_id?.nome ?? "Sem categoria"} · {item.cidade}/{item.uf} · {data.format(new Date(item.data_cadastro))} · {item.total_interesses} interessado(s)
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.classe}`}>{status.nome}</span>
      </div>

      {item.motivo_cancelamento && (
        <p className="break-words rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <span className="font-semibold">Motivo do cancelamento:</span> {item.motivo_cancelamento}
        </p>
      )}

      {cancelavel && !aberto && (
        <button type="button" onClick={() => setAberto(true)} className={`${botao} border-red-200 text-red-700 hover:bg-red-50`}>
          Cancelar anúncio
        </button>
      )}

      {cancelavel && aberto && (
        <form action={cancelar} aria-busy={pendente} className="space-y-3">
          <input type="hidden" name="id" value={item._id} />
          <label htmlFor={campoMotivo} className="block text-sm font-medium">
            Motivo da moderação
            <textarea
              id={campoMotivo}
              name="motivo"
              required
              minLength={10}
              maxLength={2000}
              rows={3}
              disabled={pendente}
              aria-describedby={`${campoMotivo}-ajuda`}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-normal focus-visible:outline-blue-600"
            />
          </label>
          <p id={`${campoMotivo}-ajuda`} className="text-xs text-slate-500">
            O doador recebe este motivo na notificação. Os interessados também são avisados. Mínimo de 10 caracteres.
          </p>
          <div className="flex flex-wrap gap-2">
            <button disabled={pendente} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {pendente ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
            <button type="button" disabled={pendente} onClick={() => setAberto(false)} className={botao}>
              Voltar
            </button>
          </div>
        </form>
      )}

      {resultado.mensagem && (
        <p role={resultado.sucesso ? "status" : "alert"} className={`text-sm ${resultado.sucesso ? "text-emerald-700" : "text-red-700"}`}>
          {resultado.mensagem}
        </p>
      )}
    </li>
  );
}
