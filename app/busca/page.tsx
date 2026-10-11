import type { Metadata } from "next";
import { PublicSiteShell } from "@/components/home/public-site-shell";
import { SearchPageContent } from "@/components/home/search-page-content";
import { lerFiltros, listarCategoriasFeed, listarFeed } from "@/lib/feed";

export const metadata: Metadata = { title: "Buscar doações | Doaí", description: "Busque doações por item, categoria, condição e localização." };

export default async function BuscarDoacoes({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = lerFiltros(await searchParams);
  const [itens, categorias] = await Promise.allSettled([listarFeed(filtros), listarCategoriasFeed()]);
  const resultado = itens.status === "fulfilled" ? itens.value : null;

  return (
    <PublicSiteShell>
      <SearchPageContent
        filtros={filtros}
        resultado={resultado}
        categorias={categorias.status === "fulfilled" ? categorias.value : []}
        erroCategorias={categorias.status === "rejected"}
      />
    </PublicSiteShell>
  );
}
