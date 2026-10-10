import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { FeedRetry } from "@/components/feed/feed-retry";
import { NotificacaoLida } from "@/components/perfil/notificacao-lida";
import type { Paginado } from "@/types/api";

type Notificacao = { _id: string; titulo: string; mensagem: string; lida: boolean; data_criacao: string };
export default async function Notificacoes({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const query = await searchParams;
  const page = query.page && /^\d+$/.test(query.page) && Number.isSafeInteger(Number(query.page)) && Number(query.page) > 0 ? Number(query.page) : 1;
  let lista: Paginado<Notificacao>;
  try { lista = await fetchApiAutenticado<Paginado<Notificacao>>("notificacoes", { params: { page, limit: 20 }, signal: AbortSignal.timeout(10000) }); }
  catch (erro) { unstable_rethrow(erro); return <section role="alert" className="rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">Notificações indisponíveis</h1><p className="mt-2">Não foi possível carregar suas notificações.</p><FeedRetry /></section>; }
  return <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Notificações</h1>{lista.totalDocs > 0 && <NotificacaoLida />}</div>
    {lista.docs.length === 0 ? <p className="rounded-2xl border bg-white p-6">Nenhuma notificação nesta página.</p> : <ul className="space-y-3">{lista.docs.map(n => <li key={n._id} className={`space-y-3 rounded-2xl border bg-white p-5 ${n.lida ? "border-gray-100" : "border-blue-200"}`}><h2 className="font-semibold">{n.titulo} {!n.lida && <span className="text-xs text-blue-700">Não lida</span>}</h2><p className="break-words text-sm text-gray-600">{n.mensagem}</p><time dateTime={n.data_criacao} className="text-xs text-gray-500">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Cuiaba" }).format(new Date(n.data_criacao))}</time>{!n.lida && <NotificacaoLida id={n._id} />}</li>)}</ul>}
    <nav aria-label="Paginação das notificações" className="flex items-center justify-between gap-4 text-sm text-blue-700">{lista.hasPrevPage && <Link href={`?page=${page - 1}`}>Página anterior</Link>}<span>Página {lista.page} de {lista.totalPages}</span>{lista.hasNextPage && <Link href={`?page=${page + 1}`}>Próxima página</Link>}</nav>
  </section>;
}
