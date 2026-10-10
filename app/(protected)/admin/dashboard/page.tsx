import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DashboardRefresh } from "@/components/admin/dashboard-refresh";
import { obterDashboardAdmin } from "@/lib/admin-dashboard-server";

export default async function AdminDashboardPage() {
  const metricas = await obterDashboardAdmin();
  const falhou = metricas.some((metrica) => metrica.total === null);
  const vazio = metricas.every((metrica) => metrica.total === 0);
  return <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Painel administrativo</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">Acompanhe os cadastros, as doações e a fila de análise.</p>
      </div>
      <DashboardRefresh falhou={falhou} />
    </div>
    {falhou && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Não foi possível consultar todos os indicadores. As contagens disponíveis estão abaixo. Tente novamente para atualizar.
    </p>}
    {vazio && <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Ainda não há cadastros, itens ou denúncias para acompanhar.</p>}
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metricas.map((metrica) => <Card key={metrica.id} data-metrica={metrica.id} className="gap-2 p-6">
        <dt className="font-semibold">{metrica.titulo}</dt>
        <dd className="mt-1 text-3xl font-bold text-primary">
          {metrica.total === null ? <span className="text-base font-semibold text-muted-foreground">Indisponível</span> : metrica.total.toLocaleString("pt-BR")}
        </dd>
        <p className="text-sm text-muted-foreground">{metrica.total === null ? "A consulta falhou. Tente novamente." : metrica.descricao}</p>
      </Card>)}
    </dl>
    <p className="text-xs text-muted-foreground">Cada indicador corresponde a uma consulta independente. Os números podem mudar entre consultas; use Atualizar indicadores para consultar novamente.</p>
    <nav aria-label="Áreas administrativas" className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
      <Link href="/admin/usuarios" className="underline underline-offset-4">Usuários</Link>
      <Link href="/admin/denuncias" className="underline underline-offset-4">Denúncias</Link>
      <Link href="/admin/auditoria" className="underline underline-offset-4">Auditoria</Link>
    </nav>
  </main>;
}
