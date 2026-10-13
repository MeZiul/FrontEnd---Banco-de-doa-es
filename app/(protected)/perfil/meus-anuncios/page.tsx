import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";
import { MeusAnunciosLista } from "@/components/perfil/meus-anuncios-lista";
import type { MeuAnuncio } from "@/types/item-doacao";

function lerPagina(valor: string | string[] | undefined) {
  if (typeof valor !== "string" || !/^\d+$/.test(valor)) return 1;
  const pagina = Number(valor);
  return Number.isSafeInteger(pagina) && pagina > 0 ? pagina : 1;
}

export default async function MeusAnuncios({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; status?: string | string[] }>;
}) {
  const query = await searchParams;
  const usuario = await getUsuarioLogado();
  const anuncios = await fetchApiAutenticado<MeuAnuncio[]>(`usuario/${encodeURIComponent(usuario._id)}/itens`);
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Meus Anúncios</h1>
        <p className="mt-1 text-slate-500">Acompanhe as doações que você publicou.</p>
      </div>
      <MeusAnunciosLista
        anuncios={anuncios}
        ativo={usuario.situacao === "ATIVO"}
        pagina={lerPagina(query.page)}
        status={typeof query.status === "string" ? query.status : ""}
      />
    </div>
  );
}
