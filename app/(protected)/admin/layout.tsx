// (José) Sidebar do Painel Administrativo

// Preciso testar os componentes de adimin, essa página será refeita posteriormente!!

import { redirect } from "next/navigation";
import { getUsuarioLogado } from "@/lib/auth-server";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
	const usuario = await getUsuarioLogado();

	if (usuario.perfil !== "ADMINISTRADOR") redirect("/");

	return children;
}


