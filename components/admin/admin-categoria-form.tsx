"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  excluirCategoria,
  salvarCategoria,
  type AdminCategoria,
} from "@/app/(protected)/admin/categorias/actions";

const inicial = { sucesso: false, mensagem: "" };
const campo = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-normal focus-visible:outline-blue-600";

function Mensagem({ resultado }: { resultado: typeof inicial }) {
  if (!resultado.mensagem) return null;
  return (
    <p role={resultado.sucesso ? "status" : "alert"} className={`text-sm ${resultado.sucesso ? "text-emerald-700" : "text-red-700"}`}>
      {resultado.mensagem}
    </p>
  );
}

/** Sem `categoria` cria; com `categoria` edita. */
export function CategoriaForm({ categoria, onCancelar }: { categoria?: AdminCategoria; onCancelar?: () => void }) {
  const [resultado, salvar, pendente] = useActionState(salvarCategoria, inicial);
  const formRef = useRef<HTMLFormElement>(null);
  const prefixo = categoria ? `categoria-${categoria._id}` : "nova-categoria";

  // Limpa o formulário de criação só depois de salvar; em erro os valores digitados ficam.
  useEffect(() => {
    if (resultado.sucesso && !categoria) formRef.current?.reset();
  }, [resultado, categoria]);

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    startTransition(() => salvar(dados));
  }

  return (
    <form ref={formRef} onSubmit={enviar} aria-busy={pendente} className="space-y-3">
      {categoria && <input type="hidden" name="id" value={categoria._id} />}
      <fieldset disabled={pendente} className="grid gap-3 sm:grid-cols-[1fr_7rem]">
        <label htmlFor={`${prefixo}-nome`} className="text-sm font-medium">
          Nome
          <input id={`${prefixo}-nome`} name="nome" defaultValue={categoria?.nome} required minLength={2} maxLength={60} className={campo} />
        </label>
        <label htmlFor={`${prefixo}-ordem`} className="text-sm font-medium">
          Ordem
          <input
            id={`${prefixo}-ordem`}
            name="ordem"
            type="number"
            min={0}
            max={9999}
            step={1}
            defaultValue={categoria?.ordem ?? 0}
            aria-describedby={`${prefixo}-ordem-ajuda`}
            className={campo}
          />
        </label>
        <label htmlFor={`${prefixo}-descricao`} className="text-sm font-medium sm:col-span-2">
          Descrição (opcional)
          <textarea id={`${prefixo}-descricao`} name="descricao" defaultValue={categoria?.descricao ?? ""} maxLength={300} rows={2} className={campo} />
        </label>
        <p id={`${prefixo}-ordem-ajuda`} className="text-xs text-slate-500 sm:col-span-2">
          Categorias com ordem menor aparecem primeiro nas listas.
        </p>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="ativo" defaultChecked={categoria?.ativo ?? true} className="h-4 w-4 accent-blue-600" />
          Ativa (aparece para quem anuncia e busca doações)
        </label>
      </fieldset>
      <Mensagem resultado={resultado} />
      <div className="flex flex-wrap gap-2">
        <button disabled={pendente} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {pendente ? "Salvando…" : categoria ? "Salvar alterações" : "Criar categoria"}
        </button>
        {onCancelar && (
          <button type="button" disabled={pendente} onClick={onCancelar} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">
            {resultado.sucesso ? "Fechar" : "Cancelar"}
          </button>
        )}
      </div>
    </form>
  );
}

export function AdminCategoriaCard({ categoria }: { categoria: AdminCategoria }) {
  const [editando, setEditando] = useState(false);
  const [resultado, excluir, excluindo] = useActionState(excluirCategoria, inicial);

  return (
    <li className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-semibold">{categoria.nome}</h2>
          {categoria.descricao && <p className="break-words text-sm text-slate-600">{categoria.descricao}</p>}
          <p className="text-xs text-slate-500">Ordem {categoria.ordem}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${categoria.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {categoria.ativo ? "Ativa" : "Inativa"}
        </span>
      </div>

      {editando ? (
        <CategoriaForm categoria={categoria} onCancelar={() => setEditando(false)} />
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={excluindo} onClick={() => setEditando(true)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">
            Editar
          </button>
          <form
            action={excluir}
            onSubmit={(evento) => {
              if (!window.confirm(`Excluir a categoria ${categoria.nome}?`)) evento.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={categoria._id} />
            <button disabled={excluindo} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50">
              {excluindo ? "Excluindo…" : "Excluir"}
            </button>
          </form>
        </div>
      )}
      <Mensagem resultado={resultado} />
    </li>
  );
}
