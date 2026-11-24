import { unstable_rethrow } from "next/navigation";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import { AdminItemCard } from "@/components/admin/admin-item-card";
import { FeedRetry } from "@/components/feed/feed-retry";
import { BarraFiltros } from "@/components/shared/barra-filtros";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";
import { FILTROS_ITENS, filtrosValidos } from "@/lib/admin-filtros";
import type { Paginado } from "@/types/api";
import type { AdminItem } from "./actions";

export default async function AdminItensPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const textoPagina = typeof query.pagina === "string" ? query.pagina : "";
  const page = /^\d+$/.test(textoPagina) && Number.isSafeInteger(Number(textoPagina)) && Number(textoPagina) > 0 ? Number(textoPagina) : 1;
  // Só repassa filtros conhecidos; o resto da URL é ignorado.
  const filtros = filtrosValidos(FILTROS_ITENS, query);

  let lista: Paginado<AdminItem> | null = null;
  try {
    lista = await fetchApiAutenticado<Paginado<AdminItem>>("admin/itens", {
      params: { page, limit: 20, ...filtros },
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    unstable_rethrow(erro);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col gap-5">
      <AdminCardHeader />
      <h1 className="text-2xl font-bold">Anúncios</h1>
      <BarraFiltros campos={FILTROS_ITENS} recarregarServidor id="filtros-itens" />

      {!lista ? (
        <section role="alert" className="rounded-2xl border bg-white p-6">
          <p>Não foi possível carregar os anúncios.</p>
          <FeedRetry />
        </section>
      ) : lista.docs.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-muted-foreground">Nenhum anúncio encontrado.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{lista.totalDocs} anúncio(s) encontrado(s)</p>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {lista.docs.map((item) => <AdminItemCard key={item._id} item={item} />)}
          </ul>
          <PaginacaoLinks
            pagina={page}
            totalPaginas={Math.max(1, lista.totalPages)}
            caminho="/admin/itens"
            parametro="pagina"
            rotulo="Paginação dos anúncios"
            extras={filtros}
          />
        </>
      )}
    </div>
  );
}