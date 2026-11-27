
import { PerfilSidebar } from "@/components/layout/perfil-sidebar";
import { getUsuarioLogado } from "@/lib/auth-server";

export default async function PerfilLayout({ children }: LayoutProps<"/perfil">) {
    const usuario = await getUsuarioLogado();

    return (
        <div className="flex w-full flex-col md:flex-row">
            <PerfilSidebar
                nome={usuario.nome}
                email={usuario.email}
            />

            {/* Área Principal */}
            <div className="min-w-0 flex-1 px-4 py-6 md:ml-64 md:px-8 md:py-8">
                {children}
            </div>
        </div>
    );
}