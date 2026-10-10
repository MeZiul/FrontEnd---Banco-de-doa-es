import Link from "next/link";
import { AccountNavigation } from "@/components/layout/account-navigation";
import { Heart, MapPin } from "lucide-react";
import { FeedFilters } from "@/components/feed/feed-filters";
import { FeedPhoto } from "@/components/feed/feed-photo";
import { FeedRetry } from "@/components/feed/feed-retry";
import { fotoFeed, lerFiltros, listarCategoriasFeed, listarFeed, urlFeed } from "@/lib/feed";
import { CONDICOES } from "@/types/feed";

export default async function Home({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = lerFiltros(await searchParams);
  const [itens, categorias] = await Promise.allSettled([listarFeed(filtros), listarCategoriasFeed()]);
  const resultado = itens.status === "fulfilled" ? itens.value : null;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav aria-label="Navegação principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-700"><Heart className="size-7 fill-current" aria-hidden="true" />Doaí</Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <AccountNavigation />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl space-y-7 px-5 py-8">
        <div><h1 className="text-3xl font-bold tracking-tight">Doações disponíveis</h1><p className="mt-2 text-slate-600">Encontre itens que podem ganhar uma nova história com você.</p></div>
        <Link href="/doacoes/nova" className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Anunciar uma doação</Link>
        <FeedFilters key={urlFeed(filtros)} filtros={filtros} categorias={categorias.status === "fulfilled" ? categorias.value : []} erroCategorias={categorias.status === "rejected"} />
        {!resultado ? (
          <section role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">Não foi possível carregar as doações</h2>
            <p className="mt-2 text-slate-600">Tente novamente em instantes. Seus filtros foram preservados.</p><FeedRetry />
          </section>
        ) : (
          <section aria-labelledby="resultados-titulo">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 id="resultados-titulo" className="text-lg font-semibold">{resultado.totalDocs} {resultado.totalDocs === 1 ? "doação encontrada" : "doações encontradas"}</h2>
              <p className="text-sm text-slate-600">Página {resultado.page} de {resultado.totalPages}</p>
            </div>
            {resultado.docs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <h3 className="text-xl font-semibold">{filtros.page > 1 ? "Não há doações nesta página" : "Nenhuma doação encontrada"}</h3>
                <p className="mt-2 text-slate-600">{filtros.page > 1 ? "Volte à primeira página para ver os resultados destes filtros." : "Tente outra busca ou ajuste os filtros para encontrar doações."}</p>
                <Link href={filtros.page > 1 ? urlFeed(filtros, 1) : "/"} className="mt-4 inline-block text-blue-700 underline underline-offset-4">{filtros.page > 1 ? "Voltar à primeira página" : "Limpar filtros"}</Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {resultado.docs.map(item => (
                  <article key={item._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <FeedPhoto src={fotoFeed(item)} titulo={item.titulo} />
                    <div className="space-y-3 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{item.categoria_id?.nome || "Doação"}</p>
                      <h3 className="break-words text-lg font-semibold leading-snug">{item.titulo}</h3>
                      <Link href={`/doacoes/${item._id}`} className="inline-block text-sm font-semibold text-blue-700 underline">Ver detalhes</Link>
                      <p className="text-sm text-slate-600">{CONDICOES[item.condicao_item] ?? "Condição não informada"}</p>
                      <p className="flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="size-4 shrink-0" aria-hidden="true" />{[item.cidade, item.uf].filter(Boolean).join(" / ") || "Localização não informada"}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {(resultado.hasPrevPage || resultado.hasNextPage) && (
              <nav aria-label="Paginação das doações" className="mt-7 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
                {resultado.hasPrevPage && resultado.prevPage && <Link href={urlFeed(filtros, resultado.prevPage)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100">Página anterior</Link>}
                <span aria-current="page">Página {resultado.page}</span>
                {resultado.hasNextPage && resultado.nextPage && <Link href={urlFeed(filtros, resultado.nextPage)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100">Próxima página</Link>}
              </nav>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
