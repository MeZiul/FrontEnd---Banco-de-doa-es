import { redirect } from "next/navigation";
import { PublicSiteShell } from "@/components/home/public-site-shell";
import { PublicHomeContent } from "@/components/home/public-home-content";
import { urlBuscas } from "@/components/home/search-utils";
import { lerFiltros, listarCategoriasFeed, listarFeed } from "@/lib/feed";

const parametrosDeBusca = ["busca", "categoria_id", "cidade", "uf", "condicao_item", "ordenacao", "page"] as const;

export default async function Home({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  if (parametrosDeBusca.some(parametro => Object.hasOwn(query, parametro))) {
    redirect(urlBuscas(lerFiltros(query)));
  }

  const [feed, categorias] = await Promise.allSettled([listarFeed(lerFiltros({})), listarCategoriasFeed()]);
  const items = feed.status === "fulfilled" ? feed.value.docs.slice(0, 4) : [];

  return (
    <PublicSiteShell
      exploreSidebar
      categorias={categorias.status === "fulfilled" ? categorias.value : []}
    >
      <PublicHomeContent items={items} feedUnavailable={feed.status === "rejected"} />
    </PublicSiteShell>
  );
}
