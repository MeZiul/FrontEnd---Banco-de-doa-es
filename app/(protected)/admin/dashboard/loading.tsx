export default function DashboardLoading() {
  return <main aria-busy="true" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <h1 className="text-2xl font-bold text-foreground">Painel administrativo</h1>
    <p role="status" className="text-muted-foreground">Consultando os indicadores…</p>
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, indice) => <Skeleton key={indice} className="h-40 motion-reduce:animate-none" />)}
    </div>
  </main>;
}
import { Skeleton } from "@/components/ui/skeleton";

