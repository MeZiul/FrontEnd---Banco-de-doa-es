"use server";

import { headers } from "next/headers";
import {
  redefinirSenhaNativa,
  solicitarRedefinicaoDeSenha,
} from "@/lib/auth-native-client";
import {
  lerRecuperacao,
  validarRedefinicao,
} from "@/lib/perfil-validation";

export type ResultadoRecuperacao = { sucesso: boolean; mensagem: string };

function destinoDeRecuperacao(origem: string | null): string | undefined {
  if (!origem) return undefined;
  try {
    const url = new URL(origem);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (
      url.protocol === "http:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ) {
      return undefined;
    }
    return new URL("/redefinir-senha", url.origin).toString();
  } catch {
    return undefined;
  }
}

function statusDoErro(erro: unknown): number | undefined {
  if (!erro || typeof erro !== "object" || !("status" in erro))
    return undefined;
  return typeof erro.status === "number" ? erro.status : undefined;
}

export async function solicitarRecuperacao(
  _anterior: ResultadoRecuperacao,
  form: FormData,
): Promise<ResultadoRecuperacao> {
  const { email } = lerRecuperacao({ email: form.get("email") });

  const redirectTo = destinoDeRecuperacao((await headers()).get("origin"));
  if (!redirectTo) {
    return {
      sucesso: false,
      mensagem: "Não foi possível solicitar a recuperação. Tente novamente.",
    };
  }

  try {
    const resposta = await solicitarRedefinicaoDeSenha(email, redirectTo);
    if (resposta.error) {
      return {
        sucesso: false,
        mensagem:
          resposta.error.status === 429
            ? "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
            : resposta.error.status === 400
              ? "Informe um e-mail válido."
              : "Não foi possível solicitar a recuperação. Tente novamente.",
      };
    }
    if (!resposta.data?.status) {
      return {
        sucesso: false,
        mensagem: "Não foi possível solicitar a recuperação. Tente novamente.",
      };
    }
    return {
      sucesso: true,
      mensagem:
        "Se houver uma conta com este e-mail, a solicitação foi recebida. Se o envio estiver habilitado, você receberá instruções por e-mail.",
    };
  } catch {
    return {
      sucesso: false,
      mensagem: "Não foi possível solicitar a recuperação. Tente novamente.",
    };
  }
}

export async function redefinirSenha(
  _anterior: ResultadoRecuperacao,
  form: FormData,
): Promise<ResultadoRecuperacao> {
  const resultado = validarRedefinicao({
    token: form.get("token"),
    novaSenha: form.get("novaSenha"),
    confirmarSenha: form.get("confirmarSenha"),
  });
  if (resultado.erro !== undefined)
    return { sucesso: false, mensagem: resultado.erro };

  try {
    const resposta = await redefinirSenhaNativa(
      resultado.dados.novaSenha,
      resultado.dados.token,
    );
    if (!resposta.error && resposta.data?.status) {
      return {
        sucesso: true,
        mensagem:
          "Senha redefinida com sucesso. Entre novamente com sua nova senha.",
      };
    }
    
    if (resposta.error?.code === "WEAK_PASSWORD" && resposta.error.message) {
      return { sucesso: false, mensagem: resposta.error.message };
    }
    if (resposta.error && resposta.error.status === 429) {
      return {
        sucesso: false,
        mensagem:
          "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
      };
    }
    if (
      resposta.error &&
      ![400, 401, 403, 404].includes(resposta.error.status)
    ) {
      return {
        sucesso: false,
        mensagem: "Não foi possível redefinir a senha. Tente novamente.",
      };
    }
    return {
      sucesso: false,
      mensagem:
        "Este link é inválido ou expirou. Solicite um novo link de recuperação.",
    };
  } catch (erro) {
    const status = statusDoErro(erro);
    return {
      sucesso: false,
      mensagem:
        status === 429
          ? "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
          : status !== undefined && [400, 401, 403, 404].includes(status)
            ? "Este link é inválido ou expirou. Solicite um novo link de recuperação."
            : "Não foi possível redefinir a senha. Tente novamente.",
    };
  }
}
