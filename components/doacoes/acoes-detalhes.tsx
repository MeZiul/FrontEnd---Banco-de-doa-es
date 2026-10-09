"use client";
import { useActionState, useState } from "react";
import { avaliarDoacao, denunciarDoacao } from "@/app/doacoes/[id]/actions";
const campo = "mt-2 w-full rounded-lg border border-slate-300 bg-white p-3";
const botao = "rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50 disabled:opacity-50";

export function CompartilharDoacao({ titulo }: { titulo: string }) {
  const [mensagem, setMensagem] = useState("");
  const [link, setLink] = useState("");
  async function compartilhar() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: titulo, url });
      else { await navigator.clipboard.writeText(url); setMensagem("Link copiado."); }
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") return;
      setLink(url); setMensagem("Copie o endereço abaixo para compartilhar.");
    }
  }
  return <div className="space-y-2"><button className={botao} onClick={compartilhar}>Compartilhar doação</button>{mensagem && <p role="status" className="text-sm">{mensagem}</p>}{link && <label className="block text-sm">Link da doação<input readOnly value={link} onFocus={evento => evento.currentTarget.select()} className={campo} /></label>}</div>;
}

export function DenunciaForm({ itemId }: { itemId: string }) {
  const [resultado, action, pendente] = useActionState(denunciarDoacao, { sucesso: false, mensagem: "" });
  return <details className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold text-red-700">Denunciar item ou doador</summary><form action={action} className="mt-4 space-y-4">
    <input name="item_id" type="hidden" value={itemId} />
    {!resultado.sucesso && <fieldset disabled={pendente} className="space-y-4"><label className="block text-sm">Alvo<select aria-label="Alvo" name="tipo_alvo" className={campo}><option value="ITEM">Este item</option><option value="USUARIO">O doador deste item</option></select></label><label className="block text-sm">Motivo<select aria-label="Motivo" name="motivo" className={campo}><option value="CONTEUDO_INAPROPRIADO">Conteúdo inapropriado</option><option value="ITEM_PROIBIDO">Item proibido</option><option value="FRAUDE">Fraude</option><option value="ASSEDIO">Assédio</option><option value="SPAM">Spam</option><option value="OUTRO">Outro</option></select></label><label className="block text-sm">Descrição (opcional)<textarea name="descricao" maxLength={2000} rows={3} className={campo} /></label><button className={botao}>{pendente ? "Registrando…" : "Enviar denúncia"}</button></fieldset>}
    {resultado.mensagem && <p role={resultado.sucesso ? "status" : "alert"}>{resultado.mensagem}</p>}
  </form></details>;
}

export function AvaliacaoDoacaoForm({ itemId }: { itemId: string }) {
  const [resultado, action, pendente] = useActionState(avaliarDoacao, { sucesso: false, mensagem: "" });
  return <section className="rounded-xl border border-slate-200 p-5"><h2 className="font-semibold">Avaliar a experiência da doação</h2><p className="mt-2 text-sm text-slate-600">Os participantes podem avaliar uma vez, em até 30 dias após a conclusão.</p><form action={action} className="mt-4 space-y-4">
    <input name="item_id" type="hidden" value={itemId} />
    {!resultado.sucesso && <fieldset disabled={pendente} className="space-y-4"><label className="block text-sm">Nota<select aria-label="Nota" name="nota" required defaultValue="" className={campo}><option value="" disabled>Selecione a nota</option>{[1,2,3,4,5].map(nota => <option value={nota} key={nota}>{nota} {nota === 1 ? "estrela" : "estrelas"}</option>)}</select></label><label className="block text-sm">Comentário (opcional)<textarea name="comentario" maxLength={2000} rows={3} className={campo} /></label><button className={botao}>{pendente ? "Registrando…" : "Enviar avaliação"}</button></fieldset>}
    {resultado.mensagem && <p role={resultado.sucesso ? "status" : "alert"}>{resultado.mensagem}</p>}
  </form></section>;
}
