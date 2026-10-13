import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

const AUTH_BASE_PATH = "/api/auth";
const AUTH_TIMEOUT_MS = 10_000;

function criarClienteAuthNativo() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL)
    throw new Error("Defina NEXT_PUBLIC_API_URL para conectar à API.");

  return createAuthClient({
    baseURL,
    basePath: AUTH_BASE_PATH,
    disableDefaultFetchPlugins: true,
    fetchOptions: {
      credentials: "omit",
      retry: 0,
    },
    plugins: [
      inferAdditionalFields({
        user: {
          cpf: { type: "string" },
          telefone: { type: "string" },
          cidade: { type: "string" },
          uf: { type: "string" },
        },
      }),
    ],
  });
}

export async function autenticarComEmail(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  return criarClienteAuthNativo().signIn.email({
    email,
    password,
    rememberMe,
    fetchOptions: { signal: AbortSignal.timeout(AUTH_TIMEOUT_MS) },
  });
}

export async function cadastrarComEmail(dados: {
  name: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  cidade: string;
  uf: string;
}) {
  return criarClienteAuthNativo().signUp.email({
    ...dados,
    fetchOptions: { signal: AbortSignal.timeout(AUTH_TIMEOUT_MS) },
  });
}

export async function solicitarRedefinicaoDeSenha(
  email: string,
  redirectTo: string,
) {
  return criarClienteAuthNativo().requestPasswordReset({
    email,
    redirectTo,
    fetchOptions: { signal: AbortSignal.timeout(AUTH_TIMEOUT_MS) },
  });
}

export async function redefinirSenhaNativa(newPassword: string, token: string) {
  return criarClienteAuthNativo().resetPassword({
    newPassword,
    token,
    fetchOptions: { signal: AbortSignal.timeout(AUTH_TIMEOUT_MS) },
  });
}

export async function consultarSessaoNativa(token: string) {
  return criarClienteAuthNativo().getSession({
    fetchOptions: {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    },
  });
}

export async function encerrarSessaoNativa(token: string) {
  return criarClienteAuthNativo().signOut({
    fetchOptions: {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    },
  });
}
