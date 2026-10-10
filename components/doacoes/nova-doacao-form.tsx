"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { criarDoacao } from "@/app/(protected)/doacoes/nova/actions";
import { validarFotos } from "@/lib/doacao-validation";
import { CONDICOES, type CategoriaFeed } from "@/types/feed";
import { UFS } from "@/lib/feed";

const campo = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus-visible:outline-blue-600";
export function NovaDoacaoForm({ categorias, cidade, uf }: { categorias: CategoriaFeed[]; cidade: string; uf: string }) {
  const [itemId, setItemId] = useState<string>();
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pendente, iniciar] = useTransition();
  const [enviadas, setEnviadas] = useState(0);
  const [fotosPendentes, setFotosPendentes] = useState<File[]>([]);

  function enviar(dados: FormData) {
    iniciar(async () => {
      setMensagem(""); setSucesso(false);
      let fotos = itemId ? fotosPendentes : dados.getAll("fotos").filter((valor): valor is File => valor instanceof File && valor.name !== "");
      try { validarFotos(fotos, 5 - enviadas); }
      catch (erro) { setMensagem((erro as Error).message); return; }
      let id = itemId;
      if (!id) {
        // Files travel through the bounded upload endpoint, never through Server Actions.
        const campos = new FormData();
        for (const [nome, valor] of dados.entries()) if (typeof valor === "string") campos.set(nome, valor);
        const resultado = await criarDoacao(campos);
        if (!resultado.sucesso || !resultado.itemId) { setMensagem(resultado.mensagem); return; }
        id = resultado.itemId; setItemId(id); setFotosPendentes(fotos);
      }
      for (const foto of fotos) {
        try {
          const multipart = new FormData(); multipart.append("fotos", foto);
          const resposta = await fetch(`/api/doacoes/${id}/fotos`, { method: "POST", body: multipart, signal: AbortSignal.timeout(35000) });
          const json = await resposta.json();
          if (!resposta.ok) { setMensagem(`O anúncio foi salvo. ${json.mensagem}`); return; }
          setEnviadas(valor => valor + 1);
          fotos = fotos.slice(1); setFotosPendentes(fotos);
        } catch { setMensagem("O anúncio foi salvo, mas o envio da foto não foi confirmado. Confira as fotos antes de reenviar."); return; }
      }
      setSucesso(true); setMensagem("Sua doação está disponível. Você pode acompanhar os interessados em Meus anúncios.");
    });
  }

  return <form action={enviar} className="space-y-5 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    {!itemId && <fieldset disabled={pendente} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">Título<input name="titulo" required minLength={3} maxLength={100} className={campo} /></label>
      <label className="text-sm font-medium sm:col-span-2">Descrição<textarea name="descricao" required minLength={10} maxLength={2000} rows={4} className={campo} /></label>
      <label className="text-sm font-medium">Categoria<select aria-label="Categoria" name="categoria_id" required defaultValue="" className={campo}><option value="" disabled>Selecione uma categoria</option>{categorias.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}</select></label>
      <label className="text-sm font-medium">Condição<select aria-label="Condição" name="condicao_item" required defaultValue="USADO_BOM" className={campo}>{Object.entries(CONDICOES).map(([id, nome]) => <option value={id} key={id}>{nome}</option>)}</select></label>
      <label className="text-sm font-medium">Cidade<input name="cidade" required maxLength={100} defaultValue={cidade} className={campo} /></label>
      <label className="text-sm font-medium">UF<select aria-label="UF" name="uf" required defaultValue={uf} className={campo}><option value="" disabled>Selecione</option>{UFS.map(valor => <option key={valor}>{valor}</option>)}</select></label>
      <label className="text-sm font-medium sm:col-span-2">Bairro (opcional)<input name="bairro" maxLength={100} className={campo} /></label>
      <label className="text-sm font-medium sm:col-span-2">Condições da doação (opcional)<textarea name="condicoes_doacao" maxLength={500} rows={3} className={campo} /></label>
      <label className="text-sm font-medium sm:col-span-2">Fotos (opcional)<input name="fotos" type="file" accept="image/jpeg,image/png,image/webp" multiple className={campo} aria-describedby="limites-fotos" /><span id="limites-fotos" className="mt-2 block font-normal text-slate-600">Até 5 fotos, JPEG, PNG ou WebP, de até 4 MB e 4096 pixels por lado. As fotos são enviadas após salvar o anúncio.</span></label>
    </fieldset>}
    {mensagem && <p role={sucesso ? "status" : "alert"} className={sucesso ? "text-emerald-700" : "text-red-700"}>{mensagem}</p>}
    {!sucesso && <button disabled={pendente || categorias.length === 0} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{pendente ? "Salvando doação e fotos…" : itemId ? "Tentar enviar fotos restantes" : "Publicar doação"}</button>}
    {itemId && <div className="flex flex-wrap gap-4 text-sm font-semibold text-blue-700"><Link href={`/doacoes/${itemId}`} className="underline">Ver anúncio e conferir fotos ({enviadas} enviada(s))</Link><Link href="/perfil/meus-anuncios" className="underline">Meus anúncios</Link></div>}
  </form>;
}
