
import { PerfilSidebar } from "@/components/layout/perfil-sidebar";
import { getUsuarioLogado } from "@/lib/auth-server";

export default async function PerfilLayout({ children }: LayoutProps<"/perfil">) {
    const usuario = await getUsuarioLogado();

    return (
        <div className="flex w-full max-w-7xl mx-auto flex-col gap-8 py-8 px-4 md:flex-row md:px-8">
            <PerfilSidebar nome={usuario.nome} email={usuario.email} />

            {/* Área Principal */}
            <div className="min-w-0 flex-1">
            {children}
            </div>
        </div>
    );
}