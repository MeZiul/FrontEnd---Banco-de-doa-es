"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import { exigirVisitante } from "@/lib/auth-guest";
import { autenticarComEmail } from "@/lib/auth-native-client";
import { destinoInterno, opcoesCookieSessao, validarCadastro, validarLogin } from "@/lib/auth-validation";

export type ResultadoAuth = { erro: string };

function mensagemErro(erro: unknown, fallback: string): ResultadoAuth {
  if (erro instanceof ErroApi && [400, 401, 403, 409, 429].includes(erro.status)) {
    return { erro: erro.message };
  }
  return { erro: fallback };
}

function mensagemErroLoginNativo(status: number | undefined): ResultadoAuth {
  if (status === 400 || status === 401) return { erro: "E-mail ou senha inválidos." };
  if (status === 403) return { erro: "Não foi possível entrar nesta conta. Verifique os dados e tente novamente." };
  if (status === 429) return { erro: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." };
  return { erro: "Não foi possível realizar o login. Tente novamente." };
}

function temSessaoNativa(valor: unknown): valor is { token: string; user: Record<string, unknown> } {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return false;
  const sessao = valor as { token?: unknown; user?: unknown };
  return typeof sessao.token === "string" && sessao.token.length > 0 &&
    typeof sessao.user === "object" && sessao.user !== null && !Array.isArray(sessao.user);
}

export async function cadastrar(entrada: unknown): Promise<ResultadoAuth> {
  await exigirVisitante();
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
  await exigirVisitante();
  const resultado = validarLogin(entrada);
  if (resultado.erro !== undefined) return { erro: resultado.erro };
  const { email, senha, lembrar } = resultado.dados;
  let resposta: Awaited<ReturnType<typeof autenticarComEmail>>;
  try {
    resposta = await autenticarComEmail(email, senha, lembrar);
  } catch (erro) {
    return mensagemErro(erro, "Não foi possível realizar o login. Tente novamente.");
  }

  if (resposta.error) return mensagemErroLoginNativo(resposta.error.status);
  if (!temSessaoNativa(resposta.data)) return { erro: "A API não retornou uma sessão válida. Tente novamente." };

  const { token } = resposta.data;
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
