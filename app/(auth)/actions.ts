"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import type { Usuario } from "@/types/usuario";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import { exigirVisitante } from "@/lib/auth-guest";
import { autenticarComEmail, encerrarSessaoNativa } from "@/lib/auth-native-client";
import { destinoInterno, lerLogin, opcoesCookieSessao, validarCadastro, validarCadastroComplementar } from "@/lib/auth-validation";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";

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

  if (resultado.erro !== undefined) {
    return { erro: resultado.erro };
  }

  let usuario: Usuario;

  try {
    usuario = await fetchApi<Usuario>("usuario", {
      metodo: "POST",
      body: resultado.dados,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (erro) {
    return mensagemErro(
      erro,
      "Não foi possível criar a conta. Tente novamente.",
    );
  }

  if (!usuario || !usuario._id) {
    return {
      erro: "A API não confirmou a criação da conta. Tente novamente.",
    };
  }
  redirect("/login?cadastro=sucesso");
}

export async function completarCadastro(entrada: unknown,): Promise<ResultadoAuth> {
  const resultado = validarCadastroComplementar(entrada);

  if (resultado.erro !== undefined) return { erro: resultado.erro };

  let usuario: Usuario;

  try {
    // Recupera a sessão real, sem utilizar o login automático de desenvolvimento
    const token = await getToken({ permitirLoginDev: false });

    if (!token || !(await validarSessaoNativa(token))) {
      return { erro: "Sua sessão expirou. Faça login novamente" };
    }

    // Atualiza exclusivamente o cadastro do usuário autenticado
    usuario = await fetchApi<Usuario>("perfil/completar-cadastro", {
      metodo: "PATCH",
      token,
      body: resultado.dados,
      signal: AbortSignal.timeout(10_000)
    }
    );
  } catch (erro) {
    if (erro instanceof ErroApi && [401, 498].includes(erro.status)) {
      return { erro: "Sua sessão expirou. Faça login novamente" };
    }

    return mensagemErro(erro, "Não foi possível concluir o cadastro. Tente novamente");
  }

  // Confirma que o backend concluiu efetivamente o cadastro
  if (!usuario?._id || usuario.cadastro_completo !== true) {
    return { erro: "A API não confirmou a conclusão do cadastro" };
  }

  redirect("/");
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
    return {
      erro: "A API não retornou uma sessão válida. Tente novamente.",
    };
  }

  const { token } = resposta.data;

  let usuario: Usuario;

  try {
    // Consulta o estado cadastral atualizado no backend
    usuario = await fetchApi<Usuario>("perfil", {
      token,
      signal: AbortSignal.timeout(10_000)
    });

    if (!usuario?._id || usuario.situacao !== "ATIVO") {
      throw new Error("A API não confirmou um perfil ativo");
    }
  } catch (erro) {
    // Tenta revogar a sessão criada caso o perfil não seja validado
    try {
      await encerrarSessaoNativa(token);
    } catch {
      // Preserva o erro original
    }

    return mensagemErro(erro, "Não foi possível verificar os dados da sua conta");
  }

  // Persiste a sessão somente após validar o perfil
  (await cookies()).set(
    COOKIE_TOKEN,
    token,
    opcoesCookieSessao(
      lembrar,
      process.env.NODE_ENV === "production"
    )
  );

  // Redireciona usuários com cadastro incompleto
  if (usuario.cadastro_completo !== true) {
    redirect("/cadastro?origem=google");
  }

  redirect(destinoInterno(destino));
}

export async function sair(): Promise<ResultadoAuth> {
  const cookieStore = await cookies();

  try {
    // Recupera a sessão tradicional ou OAuth e não utiliza o login automático de desenvolvimento
    const token = await getToken({ permitirLoginDev: false });

    if (token) {
      // Revoga a sessão no Better Auth
      const resposta = await encerrarSessaoNativa(token);

      if (resposta.error && ![401, 498].includes(resposta.error.status)) {
        return { erro: "Não foi possível encerrar a sessão. Tente novamente" };
      }
    }
  } catch (erro) {
    const status = statusDoErro(erro);

    if (status !== 401 && status !== 498) {
      return { erro: "Não foi possível encerrar a sessão. Tente novamente" };
    }
  }

  // Remove o cookie utilizado pelo login tradicional
  cookieStore.delete(COOKIE_TOKEN);

  // Remove os cookies nativos do Better Auth.
  for (const { name } of cookieStore.getAll()) {
    if (name.startsWith("better-auth.") || name.startsWith("__Secure-better-auth.")) {
      cookieStore.delete(name);
    }
  }

  redirect("/login");
}
