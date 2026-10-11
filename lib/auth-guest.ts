import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import type { Usuario } from "@/types/usuario";

/** Valida a sessão na API antes de exibir ou processar login/cadastro. */
export async function exigirVisitante(): Promise<void> {
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  if (!token) return;

  try {
    const usuario = await fetchApi<Usuario>("perfil", {
      token,
      signal: AbortSignal.timeout(10_000),
    });
    if (!usuario || typeof usuario._id !== "string" || !usuario._id || usuario.situacao !== "ATIVO") {
      throw new Error("A API não confirmou uma sessão ativa.");
    }
  } catch (erro) {
    if (erro instanceof ErroApi && [401, 498].includes(erro.status)) return;
    // Indisponibilidade não prova expiração: não liberar um segundo login.
    throw erro;
  }
  redirect("/");
}
