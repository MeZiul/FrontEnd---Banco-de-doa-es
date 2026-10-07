// (Guilherme) Gráficos Recharts e consumo de SSE
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Painel administrativo</h1>
      <p>Os gráficos e as atualizações em tempo real ainda estão em desenvolvimento.</p>
      <Link href="/admin/usuarios" className="text-blue-700 underline">Consultar usuários</Link>
    </main>
  );
}
