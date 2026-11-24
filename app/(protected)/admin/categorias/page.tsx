import { unstable_rethrow } from "next/navigation";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import { AdminCategoriaCard, CategoriaForm } from "@/components/admin/admin-categoria-form";
import { FeedRetry } from "@/components/feed/feed-retry";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";
import type { Paginado } from "@/types/api";
import type { AdminCategoria } from "./actions";

export default async function AdminCategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page =
    query.page && /^\d+$/.test(query.page) && Number.isSafeInteger(Number(query.page)) && Number(query.page) > 0
      ? Number(query.page)
      : 1;

  let lista: Paginado<AdminCategoria> | null = null;
  try {
    // Rota admin: lista também as categorias inativas.
    lista = await fetchApiAutenticado<Paginado<AdminCategoria>>("admin/categorias", {
      params: { page, limite: 20 },
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    unstable_rethrow(erro);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col gap-5">
      <AdminCardHeader />
      <h1 className="text-2xl font-bold">Categorias</h1>

      <section aria-labelledby="titulo-nova-categoria" className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 id="titulo-nova-categoria" className="font-semibold">Nova categoria</h2>
        <CategoriaForm />
      </section>

      {!lista ? (
        <section role="alert" className="rounded-2xl border bg-white p-6">
          <p>Não foi possível carregar as categorias.</p>
          <FeedRetry />
        </section>
      ) : lista.docs.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-muted-foreground">Nenhuma categoria cadastrada.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lista.docs.map((categoria) => (
              // A key muda quando a categoria muda, para o formulário de edição reabrir com os dados novos.
              <AdminCategoriaCard key={`${categoria._id}-${categoria.nome}-${categoria.ordem}-${categoria.ativo}`} categoria={categoria} />
            ))}
          </ul>
          <PaginacaoLinks
            pagina={page}
            totalPaginas={Math.max(1, lista.totalPages)}
            caminho="/admin/categorias"
            rotulo="Paginação das categorias"
          />
        </>
      )}
    </div>
  );
}
