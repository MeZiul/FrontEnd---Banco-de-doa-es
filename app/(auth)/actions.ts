"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import { exigirVisitante } from "@/lib/auth-guest";
import {
  autenticarComEmail,
  cadastrarComEmail,
  encerrarSessaoNativa,
} from "@/lib/auth-native-client";
import {
  destinoInterno,
  lerLogin,
  opcoesCookieSessao,
  validarCadastro,
} from "@/lib/auth-validation";

export type ResultadoAuth = { erro: string };

function statusDoErro(erro: unknown): number | undefined {
  if (!erro || typeof erro !== "object" || !("status" in erro))
    return undefined;
  return typeof erro.status === "number" ? erro.status : undefined;
}

function mensagemErro(erro: unknown, fallback: string): ResultadoAuth {
  if (
    erro instanceof ErroApi &&
    [400, 401, 403, 409, 429].includes(erro.status)
  ) {
    return { erro: erro.message };
  }
  return { erro: fallback };
}

function mensagemErroLoginNativo(
  status: number | undefined,
  codigo?: string,
  mensagem?: string,
): ResultadoAuth {
  if (status === 400 || status === 401)
    return { erro: "E-mail ou senha inválidos." };
  if (status === 403) {
    if (
      codigo === "ACCOUNT_SUSPENDED" &&
      typeof mensagem === "string" &&
      mensagem.trim()
    ) {
      return { erro: mensagem };
    }
    return {
      erro: "Não foi possível entrar nesta conta. Verifique os dados e tente novamente.",
    };
  }
  if (status === 429) {
    return {
      erro: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    };
  }
  return { erro: "Não foi possível realizar o login. Tente novamente." };
}

type ErroNativo = {
  status?: number;
  message?: string;
  issues?: { message?: string }[];
};

function mensagemErroCadastroNativo(erro: ErroNativo): ResultadoAuth {
  const { status } = erro;
  if (status === 400) {
    const mensagem = erro.issues?.[0]?.message || erro.message;
    if (mensagem) return { erro: mensagem };
  }
  if (status === 409) return { erro: "Já existe uma conta com estes dados." };
  if (status === 429) {
    return {
      erro: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    };
  }
  return {
    erro: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
  };
}

function temSessaoNativa(
  valor: unknown,
): valor is { token: string; user: Record<string, unknown> } {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return false;
  const sessao = valor as { token?: unknown; user?: unknown };
  return (
    typeof sessao.token === "string" &&
    sessao.token.length > 0 &&
    typeof sessao.user === "object" &&
    sessao.user !== null &&
    !Array.isArray(sessao.user)
  );
}

function temUsuarioCadastrado(valor: unknown): boolean {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return false;
  const usuario = (valor as { user?: unknown }).user;
  return Boolean(
    usuario &&
    typeof usuario === "object" &&
    !Array.isArray(usuario) &&
    typeof (usuario as { id?: unknown }).id === "string" &&
    (usuario as { id: string }).id,
  );
}

export async function cadastrar(entrada: unknown): Promise<ResultadoAuth> {
  await exigirVisitante();
  const resultado = validarCadastro(entrada);
  if (resultado.erro !== undefined) return { erro: resultado.erro };

  let resposta: Awaited<ReturnType<typeof cadastrarComEmail>>;
  try {
    resposta = await cadastrarComEmail({
      name: resultado.dados.nome,
      email: resultado.dados.email,
      password: resultado.dados.senha,
      cpf: resultado.dados.cpf,
      telefone: resultado.dados.telefone,
      cidade: resultado.dados.cidade,
      uf: resultado.dados.uf,
    });
  } catch (erro) {
    return mensagemErro(
      erro,
      "Não foi possível criar a conta. Tente novamente.",
    );
  }

  if (resposta.error) return mensagemErroCadastroNativo(resposta.error);
  if (!temUsuarioCadastrado(resposta.data)) {
    return { erro: "A API não confirmou a criação da conta. Tente novamente." };
  }
  redirect("/login?cadastro=sucesso");
}

export async function entrar(
  entrada: unknown,
  destino: unknown,
): Promise<ResultadoAuth> {
  await exigirVisitante();
  const { email, senha, lembrar } = lerLogin(entrada);

  let resposta: Awaited<ReturnType<typeof autenticarComEmail>>;
  try {
    resposta = await autenticarComEmail(email, senha, lembrar);
  } catch (erro) {
    return mensagemErro(
      erro,
      "Não foi possível realizar o login. Tente novamente.",
    );
  }

  if (resposta.error) {
    return mensagemErroLoginNativo(
      resposta.error.status,
      resposta.error.code,
      resposta.error.message,
    );
  }
  if (!temSessaoNativa(resposta.data)) {
    return { erro: "A API não retornou uma sessão válida. Tente novamente." };
  }

  const { token } = resposta.data;
  (await cookies()).set(
    COOKIE_TOKEN,
    token,
    opcoesCookieSessao(lembrar, process.env.NODE_ENV === "production"),
  );
  redirect(destinoInterno(destino));
}

export async function sair(): Promise<ResultadoAuth> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (token) {
    try {
      const resposta = await encerrarSessaoNativa(token);
      if (resposta.error && ![401, 498].includes(resposta.error.status)) {
        return { erro: "Não foi possível encerrar a sessão. Tente novamente." };
      }
    } catch (erro) {
      const status = statusDoErro(erro);
      if (status !== 401 && status !== 498) {
        return { erro: "Não foi possível encerrar a sessão. Tente novamente." };
      }
    }
  }

  cookieStore.delete(COOKIE_TOKEN);
  redirect("/login");
}
