"use client";
import { useActionState } from "react";
import { marcarLidas } from "@/app/(protected)/perfil/notificacoes/actions";
export function NotificacaoLida({ id }: { id?: string }) {
  const [estado, action, pending] = useActionState(marcarLidas, {});
  return <form action={action} className="space-y-2">
    {id ? <input type="hidden" name="id" value={id} /> : <input type="hidden" name="todas" value="true" />}
    <button type="submit" disabled={pending} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">{pending ? "Salvando…" : id ? "Marcar como lida" : "Marcar todas como lidas"}</button>
    {estado.erro && <p role="alert" className="text-sm text-red-700">{estado.erro}</p>}{estado.sucesso && <p role="status" className="text-sm text-green-700">{estado.sucesso}</p>}
  </form>;
}
