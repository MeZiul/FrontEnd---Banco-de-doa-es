import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN, loginDevAtivo } from "@/lib/auth-cookie";
import {
  autenticarComEmail,
  consultarSessaoNativa,
} from "@/lib/auth-native-client";
import type { Usuario } from "@/types/usuario";

const cacheDev = globalThis as typeof globalThis & {
  doaiTokenDev?: Promise<string>;
};

async function loginDev(): Promise<string> {
  cacheDev.doaiTokenDev ??= autenticarComEmail(
    process.env.DEV_LOGIN_EMAIL ?? "",
    process.env.DEV_LOGIN_SENHA ?? "",
    false,
  ).then(({ data, error }) => {
    if (error || !data?.token)
      throw new Error(
        "O login de desenvolvimento não retornou uma sessão válida.",
      );
    return data.token;
  });

  try {
    return await cacheDev.doaiTokenDev;
  } catch (erro) {
    cacheDev.doaiTokenDev = undefined;
    throw erro;
  }
}

export async function getToken(): Promise<string | undefined> {
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  if (token) return token;
  if (loginDevAtivo()) return loginDev();
}

function sessaoNativaAtiva(valor: unknown): boolean {
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

function statusDoErro(erro: unknown): number | undefined {
  if (!erro || typeof erro !== "object" || !("status" in erro))
    return undefined;
  return typeof erro.status === "number" ? erro.status : undefined;
}

async function sessaoValida(token: string): Promise<boolean> {
  try {
    const resposta = await consultarSessaoNativa(token);
    if (resposta.error) {
      if ([401, 498].includes(resposta.error.status)) return false;
      throw new Error("Não foi possível verificar a sessão.");
    }
    return sessaoNativaAtiva(resposta.data);
  } catch (erro) {
    if ([401, 498].includes(statusDoErro(erro) ?? -1)) return false;
    throw erro;
  }
}

export async function validarSessaoNativa(token: string): Promise<boolean> {
  return sessaoValida(token);
}

type OpcoesFetch = Omit<NonNullable<Parameters<typeof fetchApi>[1]>, "token">;

export async function fetchApiAutenticado<T>(
  caminho: string,
  opcoes: OpcoesFetch = {},
): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/login");

  if (!(await validarSessaoNativa(token))) {
    cacheDev.doaiTokenDev = undefined;
    redirect("/login");
  }

  try {
    return await fetchApi<T>(caminho, { ...opcoes, token });
  } catch (erro) {
    if (erro instanceof ErroApi && [401, 498].includes(erro.status)) {
      cacheDev.doaiTokenDev = undefined;
      redirect("/login");
    }
    throw erro;
  }
}

export async function getUsuarioLogado(): Promise<Usuario> {
  const usuario = await fetchApiAutenticado<Usuario>("perfil", {
    signal: AbortSignal.timeout(10_000),
  });
  if (
    !usuario ||
    typeof usuario._id !== "string" ||
    !usuario._id ||
    usuario.situacao !== "ATIVO"
  ) {
    redirect("/login");
  }
  return usuario;
}
