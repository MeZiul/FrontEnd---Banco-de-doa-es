import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";
import type { Usuario } from "@/types/usuario";

type OpcoesVisitante = {
  permitirCadastroIncompleto?: boolean;
};

//Valida a sessão e o perfil de domínio antes de redirecionar usuários autenticados
export async function exigirVisitante({ permitirCadastroIncompleto = false }: OpcoesVisitante = {},): Promise<Usuario | null> {

  const token = await getToken({ permitirLoginDev: false });

  if (!token) return null;

  if (!(await validarSessaoNativa(token))) {
    return null;
  }

  let usuario: Usuario;

  try {
    usuario = await fetchApi<Usuario>("perfil", {
      token,
      signal: AbortSignal.timeout(10_000),
    });
    if (
      !usuario ||
      typeof usuario._id !== "string" ||
      !usuario._id ||
      usuario.situacao !== "ATIVO"
    ) {
      throw new Error("A API não confirmou um perfil ativo.");
    }
  } catch (erro) {
    if (erro instanceof ErroApi && [401, 498].includes(erro.status)) return null;
    throw erro;
  }

  if (usuario.cadastro_completo !== true) {
    if (permitirCadastroIncompleto) {
      return usuario;
    }

    redirect("/cadastro?origem=google");
  }

  redirect("/");
}