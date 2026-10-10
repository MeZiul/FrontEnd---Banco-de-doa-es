"use client";
import { useActionState } from "react";
import { manifestarInteresse } from "@/app/doacoes/[id]/actions";

export function InteresseForm({ itemId }: { itemId: string }) {
  const [resultado, action, pendente] = useActionState(manifestarInteresse, { sucesso: false, mensagem: "" });
  return <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
    <input type="hidden" name="item_id" value={itemId} />
    {!resultado.sucesso && <fieldset disabled={pendente} className="space-y-4"><label className="block text-sm font-medium">Mensagem para o doador (opcional)<textarea name="mensagem_interessado" maxLength={2000} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3" /></label><button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{pendente ? "Enviando interesse…" : "Tenho interesse"}</button></fieldset>}
    {resultado.mensagem && <p role={resultado.sucesso ? "status" : "alert"} className={resultado.sucesso ? "text-emerald-700" : "text-red-700"}>{resultado.mensagem}</p>}
  </form>;
}
