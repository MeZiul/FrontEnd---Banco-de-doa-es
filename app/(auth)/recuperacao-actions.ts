"use server";

import { ErroApi, fetchApi } from "@/lib/api";
import { validarRecuperacao, validarRedefinicao } from "@/lib/perfil-validation";

export type ResultadoRecuperacao = { sucesso: boolean; mensagem: string };

export async function solicitarRecuperacao(_anterior: ResultadoRecuperacao, form: FormData): Promise<ResultadoRecuperacao> {
  const resultado = validarRecuperacao({ email: form.get("email") });
  if (resultado.erro !== undefined) return { sucesso: false, mensagem: resultado.erro };
  try {
    await fetchApi("auth/esqueci-senha", { metodo: "POST", body: resultado.dados, signal: AbortSignal.timeout(10000) });
    return { sucesso: true, mensagem: "Se houver uma conta com este e-mail, você receberá um link de recuperação. Confira também a pasta de spam." };
  } catch (erro) {
    return { sucesso: false, mensagem: erro instanceof ErroApi && erro.status === 429
      ? "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
      : "Não foi possível solicitar a recuperação. Tente novamente." };
  }
}

export async function redefinirSenha(_anterior: ResultadoRecuperacao, form: FormData): Promise<ResultadoRecuperacao> {
  const resultado = validarRedefinicao({ token: form.get("token"), novaSenha: form.get("novaSenha"), confirmarSenha: form.get("confirmarSenha") });
  if (resultado.erro !== undefined) return { sucesso: false, mensagem: resultado.erro };
  try {
    await fetchApi("auth/redefinir-senha", { metodo: "PUT", body: resultado.dados, signal: AbortSignal.timeout(10000) });
    return { sucesso: true, mensagem: "Senha redefinida com sucesso. Entre novamente com sua nova senha." };
  } catch (erro) {
    return { sucesso: false, mensagem: erro instanceof ErroApi && [400, 401, 403, 404].includes(erro.status)
      ? "Este link é inválido ou expirou. Solicite um novo link de recuperação."
      : "Não foi possível redefinir a senha. Tente novamente." };
  }
}
