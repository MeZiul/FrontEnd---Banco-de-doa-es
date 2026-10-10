import { exigirAdministradorAtivo } from "@/lib/admin-dashboard-server";
import { unstable_rethrow } from "next/navigation";
import { DashboardRefresh } from "@/components/admin/dashboard-refresh";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
	try {
		await exigirAdministradorAtivo();
	} catch (erro) {
		unstable_rethrow(erro);
		return <main className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
			<h1 className="text-2xl font-bold text-foreground">Área administrativa indisponível</h1>
			<p role="alert" className="text-muted-foreground">Não foi possível verificar seu acesso. Tente novamente em instantes.</p>
			<DashboardRefresh falhou />
		</main>;
	}

	return children;
}


