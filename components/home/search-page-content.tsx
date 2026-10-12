import Link from "next/link";
import type { Paginado } from "@/types/api";
import type { CategoriaFeed, FiltrosFeed, ItemFeed } from "@/types/feed";
import { fotoFeed } from "@/lib/feed";
import { DonationSearchForm } from "@/components/home/donation-search-form";
import { ExpandableDonationCard } from "@/components/home/expandable-donation-card";
import { urlBuscas } from "@/components/home/search-utils";

export function SearchPageContent({
  filtros,
  resultado,
  categorias,
  erroCategorias = false,
}: {
  filtros: FiltrosFeed;
  resultado: Paginado<ItemFeed> | null;
  categorias: CategoriaFeed[];
  erroCategorias?: boolean;
}) {
  return (
    <div className="space-y-7">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-300">Busca de doações</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Encontre algo que faça diferença.</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Pesquise pelo item e ajuste a categoria, condição ou localização para refinar os resultados.</p>
      </header>

      <DonationSearchForm key={urlBuscas(filtros)} filtros={filtros} categorias={categorias} erroCategorias={erroCategorias} />

      {!resultado ? (
        <section role="alert" className="rounded-3xl border border-red-200 bg-white p-7">
          <h2 className="text-xl font-semibold text-slate-950">Não foi possível carregar os resultados</h2>
          <p className="mt-2 text-slate-600">Seus filtros foram mantidos. Tente novamente em instantes.</p>
          <Link href={urlBuscas(filtros)} className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">Tentar novamente</Link>
        </section>
      ) : (
        <section aria-labelledby="busca-resultados-titulo">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 id="busca-resultados-titulo" className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              {resultado.totalDocs} {resultado.totalDocs === 1 ? "doação encontrada" : "doações encontradas"}
            </h2>
            {resultado.totalPages > 0 && <p className="text-sm text-slate-600 dark:text-slate-300">Página {resultado.page} de {resultado.totalPages}</p>}
          </div>

          {resultado.docs.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center sm:p-10">
              <h3 className="text-xl font-semibold text-slate-950">Nenhuma doação encontrada</h3>
              <p className="mx-auto mt-2 max-w-xl text-slate-600">Tente outro termo ou remova um filtro para ver mais resultados.</p>
              <Link href="/busca" className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-blue-800 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-sky-50">Limpar busca</Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resultado.docs.map(item => <ExpandableDonationCard key={item._id} item={item} src={fotoFeed(item)} />)}
            </div>
          )}

          {(resultado.hasPrevPage || resultado.hasNextPage) && (
            <nav aria-label="Paginação dos resultados" className="mt-7 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
              {resultado.hasPrevPage && resultado.prevPage && <Link href={urlBuscas(filtros, resultado.prevPage)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-blue-800 hover:bg-sky-50">Página anterior</Link>}
              <span aria-current="page" className="text-slate-700 dark:text-slate-300">Página {resultado.page}</span>
              {resultado.hasNextPage && resultado.nextPage && <Link href={urlBuscas(filtros, resultado.nextPage)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-blue-800 hover:bg-sky-50">Próxima página</Link>}
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
