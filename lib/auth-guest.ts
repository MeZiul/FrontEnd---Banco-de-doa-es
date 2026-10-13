import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import { consultarSessaoNativa } from "@/lib/auth-native-client";
import type { Usuario } from "@/types/usuario";

function statusDoErro(erro: unknown): number | undefined {
  if (!erro || typeof erro !== "object" || !("status" in erro)) return undefined;
  return typeof erro.status === "number" ? erro.status : undefined;
}

function sessaoNativaAtiva(valor: unknown): boolean {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return false;
  const usuario = (valor as { user?: unknown }).user;
  return Boolean(usuario && typeof usuario === "object" && !Array.isArray(usuario) &&
    typeof (usuario as { id?: unknown }).id === "string" && (usuario as { id: string }).id);
}

/** Valida Better Auth e o perfil de domínio antes de redirecionar um visitante. */
export async function exigirVisitante(): Promise<void> {
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  if (!token) return;

  try {
    const resposta = await consultarSessaoNativa(token);
    if (resposta.error) {
      if ([401, 498].includes(resposta.error.status)) return;
      throw new Error("Não foi possível verificar a sessão.");
    }
    if (!sessaoNativaAtiva(resposta.data)) return;
  } catch (erro) {
    if ([401, 498].includes(statusDoErro(erro) ?? -1)) return;
    throw erro;
  }

  try {
    const usuario = await fetchApi<Usuario>("perfil", {
      token,
      signal: AbortSignal.timeout(10_000),
    });
    if (!usuario || typeof usuario._id !== "string" || !usuario._id || usuario.situacao !== "ATIVO") {
      throw new Error("A API não confirmou um perfil ativo.");
    }
  } catch (erro) {
    if (erro instanceof ErroApi && [401, 498].includes(erro.status)) return;
    throw erro;
  }

  redirect("/");
}
