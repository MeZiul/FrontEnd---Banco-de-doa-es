import Link from "next/link";
import { Search } from "lucide-react";
import { UFS } from "@/lib/feed";
import { CONDICOES, ORDENACOES, type CategoriaFeed, type FiltrosFeed } from "@/types/feed";

const campo = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800";

export function DonationSearchForm({ filtros, categorias, erroCategorias = false }: { filtros: FiltrosFeed; categorias: CategoriaFeed[]; erroCategorias?: boolean }) {
  const categoriaDesconhecida = filtros.categoria_id && !categorias.some(categoria => categoria._id === filtros.categoria_id);
  return (
    <form action="/busca" method="get" aria-label="Filtros das doações" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold text-slate-800 sm:col-span-2 lg:col-span-3">
          O que você está procurando?
          <input className={campo} name="busca" defaultValue={filtros.busca} placeholder="Título ou descrição" type="search" />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Categoria
          <select className={campo} name="categoria_id" defaultValue={filtros.categoria_id} aria-describedby={erroCategorias ? "busca-erro-categorias" : undefined}>
            <option value="">Todas as categorias</option>
            {categoriaDesconhecida && <option value={filtros.categoria_id}>Categoria selecionada</option>}
            {categorias.map(categoria => <option key={categoria._id} value={categoria._id}>{categoria.nome}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Condição
          <select className={campo} name="condicao_item" defaultValue={filtros.condicao_item}>
            <option value="">Todas as condições</option>
            {Object.entries(CONDICOES).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Ordenar por
          <select className={campo} name="ordenacao" defaultValue={filtros.ordenacao}>
            {Object.entries(ORDENACOES).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Cidade
          <input className={campo} name="cidade" defaultValue={filtros.cidade} placeholder="Digite uma cidade" />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Estado (UF)
          <select className={campo} name="uf" defaultValue={filtros.uf}>
            <option value="">Todos os estados</option>
            {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </label>
      </div>
      {erroCategorias && <p id="busca-erro-categorias" role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">Não foi possível carregar as categorias. Os demais filtros continuam disponíveis.</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">
          <Search className="size-4" aria-hidden="true" /> Buscar doações
        </button>
        <Link href="/busca" className="rounded text-sm font-semibold text-blue-800 underline underline-offset-4">Limpar filtros</Link>
      </div>
    </form>
  );
}
