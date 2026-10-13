import { createAuthClient } from "better-auth/client";

const AUTH_BASE_PATH = "/api/auth";
const LOGIN_TIMEOUT_MS = 10_000;

export async function autenticarComEmail(email: string, password: string, rememberMe: boolean) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) throw new Error("Defina NEXT_PUBLIC_API_URL para conectar à API.");

  const authClient = createAuthClient({
    baseURL,
    basePath: AUTH_BASE_PATH,
    disableDefaultFetchPlugins: true,
    fetchOptions: {
      credentials: "omit",
      retry: 0,
    },
  });

  return authClient.signIn.email({
    email,
    password,
    rememberMe,
    fetchOptions: { signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS) },
  });
}
