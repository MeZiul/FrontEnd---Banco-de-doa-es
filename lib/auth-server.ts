import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN, loginDevAtivo } from "@/lib/auth-cookie";
import type { Usuario } from "@/types/usuario";

const cacheDev = globalThis as typeof globalThis & { doaiTokenDev?: Promise<string> };

async function loginDev(): Promise<string> {
  cacheDev.doaiTokenDev ??= fetchApi<{ token: string }>("auth/login", {
    metodo: "POST",
    body: { email: process.env.DEV_LOGIN_EMAIL, senha: process.env.DEV_LOGIN_SENHA },
  }).then(({ token }) => token);

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

type OpcoesFetch = Omit<NonNullable<Parameters<typeof fetchApi>[1]>, "token">;

export async function fetchApiAutenticado<T>(caminho: string, opcoes: OpcoesFetch = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/login");

  try {
    return await fetchApi<T>(caminho, { ...opcoes, token });
  } catch (erro) {

    if (erro instanceof ErroApi && (erro.status === 401 || erro.status === 498)) {
      cacheDev.doaiTokenDev = undefined;
      redirect("/login");
    }
    throw erro;
  }
}

export async function getUsuarioLogado(): Promise<Usuario> {
  return fetchApiAutenticado<Usuario>("perfil", { signal: AbortSignal.timeout(10000) });
}
