import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import AuditoriaCard from "@/components/admin/admin-auditoria-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedRetry } from "@/components/feed/feed-retry";
import { fetchApiAutenticado } from "@/lib/auth-server";
import type { AdminAuditoria } from "@/types/admin-auditoria";
import type { RespostaPaginada } from "../usuarios/actions";
import { ShieldCheck } from "lucide-react";

export default async function AdminAuditoriaPage({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page = query.page && /^\d+$/.test(query.page) && Number.isSafeInteger(Number(query.page)) && Number(query.page) > 0 ? Number(query.page) : 1;
  let resultado: RespostaPaginada<AdminAuditoria> | null = null;
  try {
    resultado = await fetchApiAutenticado<RespostaPaginada<AdminAuditoria>>("admin/administracoes", {
      params: { page, limit: 15 }, signal: AbortSignal.timeout(10_000),
    });
  } catch (erro) { unstable_rethrow(erro); }

  return (
    <div className="space-y-6">
      <Card className="w-full rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-2 p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#001f3f]">
            <ShieldCheck className="h-5 w-5 stroke-[2.5px] text-blue-600" aria-hidden="true" />
            Administração
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500 sm:text-base">
            Gestão de contas, moderação de anúncios e resolução de denúncias. Toda ação exige justificativa e fica registrada na trilha de auditoria.
          </CardDescription>
        </CardHeader>
      </Card>
      <div>
        <Card className="w-full rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="text-xl font-bold text-[#001f3f]">Trilha de auditoria</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
            {!resultado ? (
              <section role="alert" className="space-y-3">
                <p>Não foi possível carregar a auditoria.</p><FeedRetry />
              </section>
            ) : resultado.docs.length === 0 ? (
              <p role="status">Nenhuma ação registrada nesta página.</p>
            ) : resultado.docs.map(auditoria => <AuditoriaCard key={auditoria._id} auditoria={auditoria} />)}
            {resultado && (
              <nav aria-label="Paginação da auditoria" className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold">
                {resultado.hasPrevPage && resultado.prevPage && <Link href={`?page=${resultado.prevPage}`} className="text-blue-700 underline">Página anterior</Link>}
                <span aria-current="page">Página {resultado.page} de {resultado.totalPages} · {resultado.totalDocs} registros</span>
                {resultado.hasNextPage && resultado.nextPage && <Link href={`?page=${resultado.nextPage}`} className="text-blue-700 underline">Próxima página</Link>}
              </nav>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
