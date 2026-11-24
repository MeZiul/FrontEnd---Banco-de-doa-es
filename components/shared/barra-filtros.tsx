"use client";

import { useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";

export type OpcaoFiltro = { valor: string; nome: string };

export type CampoFiltro =
  | { tipo: "texto"; nome: string; rotulo: string; placeholder?: string; maxLength?: number }
  | { tipo: "select"; nome: string; rotulo: string; opcoes: readonly OpcaoFiltro[]; todos?: string }
  | { tipo: "data"; nome: string; rotulo: string };

type Props = {
  /** Defina a lista fora do componente (constante), para não recriar a cada render. */
  campos: readonly CampoFiltro[];
  /** true em páginas que buscam os dados no servidor (Server Components). */
  recarregarServidor?: boolean;
  id?: string;
};

const parserTexto = parseAsString.withDefault("");
const classeCampo = "h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-normal text-slate-900";

// Barra de filtros das listagens. Os valores ficam na URL (?status=...&dataInicio=...).
// Selects e datas aplicam na hora; textos aplicam com Enter ou no botão "Filtrar".
// Qualquer mudança de filtro volta para a página 1.
export function BarraFiltros({ campos, recarregarServidor = false, id = "filtros" }: Props) {
  const parsers = useMemo(
    () => Object.fromEntries([...campos.map((campo) => [campo.nome, parserTexto]), ["pagina", parserTexto]]),
    [campos],
  ) as Record<string, typeof parserTexto>;

  const [valores, setValores] = useQueryStates(parsers, { history: "push", shallow: !recarregarServidor });

  const ativos = campos.filter((campo) => valores[campo.nome]).length;
  // Recria o formulário quando a URL muda (ex.: botão Voltar), para os campos refletirem os filtros atuais.
  const chave = campos.map((campo) => valores[campo.nome]).join("|");

  function aplicar(formulario: HTMLFormElement) {
    const dados = new FormData(formulario);
    const novos = Object.fromEntries(
      campos.map((campo) => [campo.nome, String(dados.get(campo.nome) ?? "").trim() || null]),
    );
    void setValores({ ...novos, pagina: null });
  }

  function limpar() {
    void setValores({ ...Object.fromEntries(campos.map((campo) => [campo.nome, null])), pagina: null });
  }

  return (
    <form
      key={chave}
      role="search"
      aria-label="Filtros"
      onSubmit={(evento) => {
        evento.preventDefault();
        aplicar(evento.currentTarget);
      }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {campos.map((campo) => (
          <label key={campo.nome} htmlFor={`${id}-${campo.nome}`} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {campo.rotulo}
            {campo.tipo === "select" ? (
              <select
                id={`${id}-${campo.nome}`}
                name={campo.nome}
                defaultValue={valores[campo.nome]}
                onChange={(evento) => evento.currentTarget.form?.requestSubmit()}
                className={classeCampo}
              >
                <option value="">{campo.todos ?? "Todos"}</option>
                {campo.opcoes.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>{opcao.nome}</option>
                ))}
              </select>
            ) : (
              <input
                id={`${id}-${campo.nome}`}
                name={campo.nome}
                type={campo.tipo === "data" ? "date" : "search"}
                defaultValue={valores[campo.nome]}
                placeholder={campo.tipo === "texto" ? campo.placeholder : undefined}
                maxLength={campo.tipo === "texto" ? campo.maxLength ?? 100 : undefined}
                onChange={campo.tipo === "data" ? (evento) => evento.currentTarget.form?.requestSubmit() : undefined}
                className={classeCampo}
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Filtrar
        </button>
        {ativos > 0 && (
          <button type="button" onClick={limpar} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Limpar filtros ({ativos})
          </button>
        )}
      </div>
    </form>
  );
}
