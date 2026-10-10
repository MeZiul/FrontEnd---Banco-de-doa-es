import Link from "next/link";
import { getToken } from "@/lib/auth-server";
import { ErroApi, fetchApi } from "@/lib/api";
import UserDropdown from "@/components/layout/user-dropdown";
import type { Usuario } from "@/types/usuario";

export async function AccountNavigation() {
  const token = await getToken();
  let usuario: Usuario | null = null;
  if (token) {
    try { usuario = await fetchApi<Usuario>("perfil", { token, signal: AbortSignal.timeout(10000) }); }
    catch (erro) {
      if (!(erro instanceof ErroApi && [401, 498].includes(erro.status))) return <Link href="/perfil" className="text-blue-700 underline">Minha conta (temporariamente indisponível)</Link>;
    }
  }
  if (!usuario) return <><Link href="/login" className="text-blue-700 hover:underline">Entrar</Link><Link href="/cadastro" className="rounded-lg bg-blue-700 px-4 py-2.5 text-white hover:bg-blue-800">Criar conta</Link></>;
  return <><Link href="/perfil/meus-anuncios" className="text-blue-700 hover:underline">Meus anúncios</Link><Link href="/perfil/notificacoes" className="text-blue-700 hover:underline">Notificações</Link><UserDropdown usuario={{ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }} /></>;
}
