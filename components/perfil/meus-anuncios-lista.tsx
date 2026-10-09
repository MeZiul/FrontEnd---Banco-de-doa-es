"use client";

import { useActionState, useState, useTransition } from "react";
import { Package, Users } from "lucide-react";
import { alterarAnuncio, carregarInteressados } from "@/app/(protected)/perfil/meus-anuncios/actions";
import type { InteresseAnuncio, MeuAnuncio, StatusItem } from "@/types/item-doacao";

const statusInfo: Record<StatusItem, { nome: string; classe: string }> = {
  DISPONIVEL: { nome: "Disponível", classe: "bg-blue-50 text-blue-700" },
  RESERVADO: { nome: "Reservado", classe: "bg-emerald-100 text-emerald-800" },
  AGUARDANDO_CONFIRMACAO: { nome: "Aguardando confirmação", classe: "bg-yellow-100 text-yellow-800" },
  DOADO: { nome: "Doado", classe: "bg-gray-100 text-gray-700" },
  CANCELADO: { nome: "Cancelado", classe: "bg-red-50 text-red-700" },
};
const botao = "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-50";
const campo = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm";

function urlFoto(url?: string) {
  if (!url) return null;
  try {
    const resultado = new URL(url, process.env.NEXT_PUBLIC_API_URL);
    return ["http:", "https:"].includes(resultado.protocol) ? resultado.href : null;
  } catch {
    return null;
  }
}

function FotoAnuncio({ item }: { item: MeuAnuncio }) {
  const [falhou, setFalhou] = useState(false);
  const foto = urlFoto([...item.fotos].sort((a, b) => a.ordem - b.ordem)[0]?.url);
  return <div className="flex h-48 items-center justify-center bg-slate-100">
    {foto && !falhou ? (
      // As imagens são hospedadas pela API e podem vir de origens configuradas em execução.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={foto} alt={item.titulo} className="h-full w-full object-cover" onError={() => setFalhou(true)} />
    ) : <div className="flex flex-col items-center gap-2 text-slate-500"><Package aria-hidden="true" /><span className="text-sm">Sem foto disponível</span></div>}
  </div>;
}

function CardAnuncio({ item, ativo }: { item: MeuAnuncio; ativo: boolean }) {
  const [modo, setModo] = useState<"editar" | "entregar" | "cancelar" | null>(null);
  const [interesses, setInteresses] = useState<InteresseAnuncio[] | null>(null);
  const [verInteresses, setVerInteresses] = useState(false);
  const [erroInteresses, setErroInteresses] = useState("");
  const [carregando, iniciarConsulta] = useTransition();
  const [resultado, enviar, pendente] = useActionState(async (anterior: { sucesso: boolean; mensagem: string }, dados: FormData) => {
    const resposta = await alterarAnuncio(anterior, dados);
    if (resposta.sucesso) {
      setModo(null);
      if (verInteresses) {
        const atualizados = await carregarInteressados(item._id);
        setInteresses(atualizados.interesses);
        setErroInteresses(atualizados.mensagem ?? "");
      }
    }
    return resposta;
  }, { sucesso: false, mensagem: "" });
  const info = statusInfo[item.status];

  function consultarInteresses() {
    setVerInteresses(true);
    setErroInteresses("");
    iniciarConsulta(async () => {
      const resposta = await carregarInteressados(item._id);
      setInteresses(resposta.interesses);
      setErroInteresses(resposta.mensagem ?? "");
    });
  }

  return <article aria-label={item.titulo} className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
    <FotoAnuncio item={item} />
    <div className="space-y-4 p-5">
      <h2 className="text-base font-semibold text-slate-900">{item.titulo}</h2>
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${info.classe}`}>{info.nome}</span>
      <p className="flex items-center gap-2 text-sm text-slate-500"><Users className="h-4 w-4" aria-hidden="true" />{item.total_interesses} manifestação(ões) de interesse no total</p>
      <div className="flex flex-wrap gap-2">
        {ativo && <button className={botao} disabled={pendente || carregando} onClick={() => verInteresses ? setVerInteresses(false) : consultarInteresses()} aria-expanded={verInteresses} aria-controls={`interesses-${item._id}`}>{verInteresses ? "Ocultar interessados" : "Ver interessados"}</button>}
        {item.status === "DISPONIVEL" && <button className={botao} disabled={pendente} onClick={() => setModo("editar")}>Editar anúncio</button>}
        {item.status === "RESERVADO" && <button className={botao} disabled={pendente} onClick={() => setModo("entregar")}>Confirmar entrega</button>}
        {!["DOADO", "CANCELADO"].includes(item.status) && <button className={`${botao} text-red-700`} disabled={pendente} onClick={() => setModo("cancelar")}>Cancelar doação</button>}
      </div>
      {item.status === "AGUARDANDO_CONFIRMACAO" && <p className="text-sm text-slate-600">A entrega foi confirmada. Aguarde o interessado confirmar o recebimento.</p>}
      {!ativo && <p className="text-sm text-slate-600">Sua conta precisa estar ativa para consultar e responder aos interessados.</p>}
      {resultado.mensagem && <p role={resultado.sucesso ? "status" : "alert"} className={`text-sm ${resultado.sucesso ? "text-emerald-700" : "text-red-700"}`}>{resultado.mensagem}</p>}
      {modo && <form action={enviar} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input type="hidden" name="id" value={item._id} />
        <input type="hidden" name="acao" value={modo} />
        <h3 className="font-semibold">{modo === "editar" ? "Editar anúncio" : modo === "entregar" ? "Confirmar entrega" : "Cancelar doação"}</h3>
        <fieldset disabled={pendente} className="space-y-3">
          {modo === "editar" && <>
            <label className="block text-sm">Título<input name="titulo" defaultValue={item.titulo} required minLength={3} maxLength={100} className={campo} /></label>
            <label className="block text-sm">Descrição<textarea name="descricao" defaultValue={item.descricao} required minLength={10} maxLength={2000} rows={4} className={campo} /></label>
            <label className="block text-sm">Condição<select name="condicao_item" defaultValue={item.condicao_item} className={campo}><option value="NOVO">Novo</option><option value="SEMINOVO">Seminovo</option><option value="USADO_BOM">Usado em bom estado</option><option value="USADO_REGULAR">Usado em estado regular</option></select></label>
            <label className="block text-sm">Cidade<input name="cidade" defaultValue={item.cidade} required maxLength={100} className={campo} /></label>
            <label className="block text-sm">UF<input name="uf" defaultValue={item.uf} required minLength={2} maxLength={2} pattern="[A-Za-z]{2}" className={campo} /></label>
            <label className="block text-sm">Bairro<input name="bairro" defaultValue={item.bairro ?? ""} maxLength={100} className={campo} /></label>
            <label className="block text-sm">Condições da doação<textarea name="condicoes_doacao" defaultValue={item.condicoes_doacao ?? ""} maxLength={500} className={campo} /></label>
          </>}
          {modo === "entregar" && <p className="text-sm">Confirme apenas depois de entregar o item ao interessado escolhido. Ele deverá confirmar o recebimento.</p>}
          {modo === "cancelar" && <><p className="text-sm">O anúncio será cancelado, inclusive se já houver uma reserva.</p><label className="block text-sm">Motivo do cancelamento<textarea name="motivo" required minLength={10} maxLength={2000} rows={3} className={campo} /></label></>}
          <div className="flex flex-wrap gap-2"><button type="submit" className={`${botao} bg-blue-600 text-white hover:bg-blue-700`}>{pendente ? "Salvando…" : modo === "editar" ? "Salvar alterações" : "Confirmar"}</button><button type="button" className={botao} onClick={() => setModo(null)}>Voltar</button></div>
        </fieldset>
      </form>}
      {verInteresses && <section id={`interesses-${item._id}`} aria-label={`Interessados em ${item.titulo}`} className="space-y-3 border-t pt-4">
        <h3 className="font-semibold">Interessados</h3>
        {carregando && <p role="status" className="text-sm">Carregando interessados…</p>}
        {erroInteresses && <div><p role="alert" className="text-sm text-red-700">{erroInteresses}</p><button className={botao} disabled={carregando || pendente} onClick={consultarInteresses}>Tentar novamente</button></div>}
        {!carregando && !erroInteresses && interesses?.length === 0 && <p className="text-sm text-slate-500">Ninguém manifestou interesse neste anúncio.</p>}
        {!carregando && !erroInteresses && interesses?.map((interesse) => <div key={interesse._id} className="space-y-2 rounded-lg border p-3 text-sm">
          <p className="font-semibold">{interesse.usuario_interessado_id.nome}</p>
          <p className="text-slate-500">{interesse.usuario_interessado_id.cidade} / {interesse.usuario_interessado_id.uf}</p>
          {interesse.mensagem_interessado && <p className="break-words">{interesse.mensagem_interessado}</p>}
          <p>Status: {{ PENDENTE: "Pendente", ACEITO: "Aceito", RECUSADO: "Recusado", CANCELADO: "Cancelado", EXPIRADO: "Expirado" }[interesse.status]}</p>
          {ativo && item.status === "DISPONIVEL" && interesse.status === "PENDENTE" && <form action={enviar} className="flex flex-wrap gap-2">
            <p className="w-full text-slate-600">Ao aceitar, o item será reservado e os demais interesses pendentes serão recusados.</p>
            <input type="hidden" name="id" value={item._id} /><input type="hidden" name="interesseId" value={interesse._id} />
            <button name="acao" value="aceitar" disabled={pendente} className={botao}>Aceitar interessado</button><button name="acao" value="recusar" disabled={pendente} className={botao}>Recusar</button>
          </form>}
        </div>)}
      </section>}
    </div>
  </article>;
}

export function MeusAnunciosLista({ anuncios, ativo }: { anuncios: MeuAnuncio[]; ativo: boolean }) {
  const [filtro, setFiltro] = useState<StatusItem | "TODOS">("TODOS");
  const visiveis = anuncios.filter((item) => filtro === "TODOS" || item.status === filtro);
  if (!anuncios.length) return <p className="rounded-2xl border border-gray-100 bg-white p-6 text-slate-500">Você ainda não publicou nenhum anúncio.</p>;
  return <>
    <label className="mb-6 block text-sm font-medium">Filtrar por status<select value={filtro} onChange={(evento) => setFiltro(evento.target.value as StatusItem | "TODOS")} className={`${campo} max-w-xs`}><option value="TODOS">Todos</option>{Object.entries(statusInfo).map(([valor, info]) => <option key={valor} value={valor}>{info.nome}</option>)}</select></label>
    {!visiveis.length && <p role="status" className="rounded-2xl border bg-white p-6 text-slate-500">Nenhum anúncio neste status.</p>}
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">{visiveis.map((item) => <CardAnuncio key={item._id} item={item} ativo={ativo} />)}</div>
  </>;
}
