import { fetchApiAutenticado } from "@/lib/auth-server";
import { EditarPerfilForm } from "@/components/perfil/editar-perfil-form";
import type { Usuario } from "@/types/usuario";

export default async function EditarPerfilPage() {
  const usuario = await fetchApiAutenticado<Usuario>("perfil", { signal: AbortSignal.timeout(10000) });
  return (
    <section className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Editar perfil</h1><p className="mt-1 text-slate-500">Mantenha seus dados atualizados para facilitar suas doações.</p></div>
      <EditarPerfilForm perfil={{ nome: usuario.nome, email: usuario.email, telefone: usuario.telefone ?? "", cidade: usuario.cidade, uf: usuario.uf, bio: usuario.bio ?? "" }} />
    </section>
  );
}
