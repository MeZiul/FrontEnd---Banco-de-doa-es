import Link from "next/link";
import { DashboardRefresh } from "@/components/admin/dashboard-refresh";
import { MetricasAoVivo } from "@/components/admin/metricas-ao-vivo";
import { obterDashboardAdmin } from "@/lib/admin-dashboard-server";

export default async function AdminDashboardPage() {
  const dashboard = await obterDashboardAdmin();
  const falhou = dashboard.metricas.some((metrica) => metrica.total === null);
  return <main className="mx-auto w-full max-w-6xl space-y-6 bg-background px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Painel administrativo</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">Acompanhe os cadastros, as doações e a fila de análise.</p>
      </div>
      <DashboardRefresh falhou={falhou} />
    </div>
    <MetricasAoVivo inicial={dashboard} />
    <p className="text-xs text-muted-foreground">Os números se atualizam sozinhos quando há cadastros, doações ou denúncias novas. Use Atualizar indicadores se a atualização automática estiver pausada.</p>
    <nav aria-label="Áreas administrativas" className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
      <Link href="/admin/usuarios" className="underline underline-offset-4">Usuários</Link>
      <Link href="/admin/denuncias" className="underline underline-offset-4">Denúncias</Link>
      <Link href="/admin/auditoria" className="underline underline-offset-4">Auditoria</Link>
    </nav>
  </main>;
}
