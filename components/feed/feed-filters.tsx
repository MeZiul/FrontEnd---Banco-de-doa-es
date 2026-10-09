import Link from "next/link";
import { UFS } from "@/lib/feed";
import { CONDICOES, ORDENACOES, type CategoriaFeed, type FiltrosFeed } from "@/types/feed";

const fieldClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export function FeedFilters({ filtros, categorias, erroCategorias }: { filtros: FiltrosFeed; categorias: CategoriaFeed[]; erroCategorias: boolean }) {
  const categoriaDesconhecida = filtros.categoria_id && !categorias.some(c => c._id === filtros.categoria_id);
  return (
    <form action="/" method="get" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Filtrar doações">
      <h2 className="text-lg font-semibold">Encontre uma doação</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-medium">Buscar por título ou descrição
          <input className={fieldClass} name="busca" defaultValue={filtros.busca} placeholder="O que você está procurando?" type="search" />
        </label>
        <label className="text-sm font-medium">Categoria
          <select className={fieldClass} name="categoria_id" defaultValue={filtros.categoria_id} aria-describedby={erroCategorias ? "erro-categorias" : undefined}>
            <option value="">Todas as categorias</option>
            {categoriaDesconhecida && <option value={filtros.categoria_id}>Categoria selecionada</option>}
            {categorias.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Condição do item
          <select className={fieldClass} name="condicao_item" defaultValue={filtros.condicao_item}>
            <option value="">Todas as condições</option>
            {Object.entries(CONDICOES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Cidade
          <input className={fieldClass} name="cidade" defaultValue={filtros.cidade} placeholder="Digite uma cidade" />
        </label>
        <label className="text-sm font-medium">Estado (UF)
          <select className={fieldClass} name="uf" defaultValue={filtros.uf}>
            <option value="">Todos os estados</option>
            {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Ordenar por
          <select className={fieldClass} name="ordenacao" defaultValue={filtros.ordenacao}>
            {Object.entries(ORDENACOES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      {erroCategorias && <p id="erro-categorias" role="status" className="mt-3 text-sm text-amber-800">Não foi possível carregar as categorias. Os outros filtros continuam disponíveis. Aplique os filtros para tentar novamente.</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" type="submit">Aplicar filtros</button>
        <Link href="/" className="rounded text-sm font-medium text-blue-700 underline underline-offset-4">Limpar filtros</Link>
      </div>
    </form>
  );
}
