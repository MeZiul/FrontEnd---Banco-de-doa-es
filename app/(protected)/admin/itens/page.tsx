import { unstable_rethrow } from "next/navigation";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import { AdminItemCard } from "@/components/admin/admin-item-card";
import { FeedRetry } from "@/components/feed/feed-retry";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";
import { STATUS_ITEM } from "@/lib/status-item";
import type { Paginado } from "@/types/api";
import type { StatusItem } from "@/types/item-doacao";
import type { AdminItem } from "./actions";

const campo = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-normal";

export default async function AdminItensPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; busca?: string }>;
}) {
  const query = await searchParams;
  const page =
    query.page && /^\d+$/.test(query.page) && Number.isSafeInteger(Number(query.page)) && Number(query.page) > 0
      ? Number(query.page)
      : 1;
  // Só repassa filtros conhecidos; o resto da URL é ignorado.
  const status = query.status && Object.hasOwn(STATUS_ITEM, query.status) ? (query.status as StatusItem) : "";
  const busca = (query.busca ?? "").trim().slice(0, 100);
  const filtros = { ...(status && { status }), ...(busca && { busca }) };

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

      <form role="search" aria-label="Filtrar anúncios" className="grid gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:grid-cols-[1fr_14rem_auto] sm:items-end">
        <label htmlFor="busca-itens" className="text-sm font-medium">
          Buscar por título ou descrição
          <input id="busca-itens" name="busca" type="search" defaultValue={busca} maxLength={100} className={campo} />
        </label>
        <label htmlFor="status-itens" className="text-sm font-medium">
          Situação
          <select id="status-itens" name="status" defaultValue={status} className={campo}>
            <option value="">Todas</option>
            {Object.entries(STATUS_ITEM).map(([valor, { nome }]) => <option key={valor} value={valor}>{nome}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Filtrar</button>
      </form>

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
            rotulo="Paginação dos anúncios"
            extras={filtros}
          />
        </>
      )}
    </div>
  );
}
