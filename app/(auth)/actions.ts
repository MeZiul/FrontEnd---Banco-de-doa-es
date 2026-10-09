"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import { destinoInterno, opcoesCookieSessao, validarCadastro, validarLogin } from "@/lib/auth-validation";

export type ResultadoAuth = { erro: string };

function mensagemErro(erro: unknown, fallback: string): ResultadoAuth {
  if (erro instanceof ErroApi && [400, 401, 403, 409, 429].includes(erro.status)) {
    return { erro: erro.message };
  }
  return { erro: fallback };
}

export async function cadastrar(entrada: unknown): Promise<ResultadoAuth> {
  const resultado = validarCadastro(entrada);
  if (resultado.erro !== undefined) return { erro: resultado.erro };
  try {
    await fetchApi("usuario", { metodo: "POST", body: resultado.dados, signal: AbortSignal.timeout(10000) });
  } catch (erro) {
    return mensagemErro(erro, "Não foi possível criar a conta. Tente novamente.");
  }
  // A fachada de cadastro não cria sessão: o usuário precisa fazer login.
  redirect("/login?cadastro=sucesso");
}

export async function entrar(entrada: unknown, destino: unknown): Promise<ResultadoAuth> {
  const resultado = validarLogin(entrada);
  if (resultado.erro !== undefined) return { erro: resultado.erro };
  const { email, senha, lembrar } = resultado.dados;
  let token: string;
  try {
    const resposta = await fetchApi<{ token: string }>("auth/login", {
      metodo: "POST", body: { email, senha }, signal: AbortSignal.timeout(10000),
    });
    if (!resposta || typeof resposta.token !== "string" || !resposta.token) {
      return { erro: "A API não retornou uma sessão válida. Tente novamente." };
    }
    token = resposta.token;
  } catch (erro) {
    return mensagemErro(erro, "Não foi possível realizar o login. Tente novamente.");
  }
  (await cookies()).set(COOKIE_TOKEN, token, opcoesCookieSessao(lembrar, process.env.NODE_ENV === "production"));
  redirect(destinoInterno(destino));
}

export async function sair(): Promise<ResultadoAuth> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (token) {
    try {
      await fetchApi("auth/logout", { metodo: "POST", token, signal: AbortSignal.timeout(10000) });
    } catch (erro) {
      // Uma sessão já expirada não precisa ser revogada novamente.
      if (!(erro instanceof ErroApi && [401, 498].includes(erro.status))) {
        return { erro: "Não foi possível encerrar a sessão. Tente novamente." };
      }
    }
  }
  cookieStore.delete(COOKIE_TOKEN);
  redirect("/login");
}
