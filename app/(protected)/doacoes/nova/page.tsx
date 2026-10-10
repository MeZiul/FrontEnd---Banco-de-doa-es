import Link from "next/link";
import { NovaDoacaoForm } from "@/components/doacoes/nova-doacao-form";
import { FeedRetry } from "@/components/feed/feed-retry";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { listarCategoriasFeed } from "@/lib/feed";
import type { Usuario } from "@/types/usuario";

export default async function NovaDoacao() {
  const usuario = await fetchApiAutenticado<Usuario>("perfil", { signal: AbortSignal.timeout(10000) });
  const categorias = await listarCategoriasFeed().catch(() => null);
  return <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8">
    <Link href="/" className="text-sm text-blue-700 underline">Voltar às doações</Link>
    <div><h1 className="text-3xl font-bold">Anunciar uma doação</h1><p className="mt-2 text-slate-600">Descreva o item e combine a retirada com o interessado escolhido.</p></div>
    {usuario.situacao !== "ATIVO" ? <p role="alert" className="rounded-xl border border-amber-200 bg-white p-5">Sua conta precisa estar ativa para anunciar doações.</p> : !categorias?.length ? <section role="alert" className="rounded-xl border border-red-200 bg-white p-5"><p>{categorias ? "Não há categorias disponíveis para anunciar." : "Não foi possível carregar as categorias."}</p><FeedRetry /></section> : <NovaDoacaoForm categorias={categorias} cidade={usuario.cidade} uf={usuario.uf} />}
  </main>;
}
