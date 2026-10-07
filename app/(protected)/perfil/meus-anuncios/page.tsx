import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";
import { MeusAnunciosLista } from "@/components/perfil/meus-anuncios-lista";
import type { MeuAnuncio } from "@/types/item-doacao";

export default async function MeusAnuncios() {
  const usuario = await getUsuarioLogado();
  const anuncios = await fetchApiAutenticado<MeuAnuncio[]>(`usuario/${encodeURIComponent(usuario._id)}/itens`);
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Meus Anúncios</h1>
        <p className="mt-1 text-slate-500">Acompanhe as doações que você publicou.</p>
      </div>
      <MeusAnunciosLista anuncios={anuncios} ativo={usuario.situacao === "ATIVO"} />
    </div>
  );
}
