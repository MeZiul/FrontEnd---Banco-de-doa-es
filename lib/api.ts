import type { ApiResposta } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ErroApi extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type OpcoesFetch = {
  metodo?: Metodo;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  // Token Bearer da sessão (ver lib/auth-server.ts)
  token?: string;
};

export async function fetchApi<T>(
  caminho: string,
  { metodo = "GET", params, body, signal, token }: OpcoesFetch = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Defina NEXT_PUBLIC_API_URL no arquivo .env.local.");
  }

  const url = new URL(caminho, `${API_URL.replace(/\/$/, "")}/`);
  for (const [chave, valor] of Object.entries(params ?? {})) {
    if (valor !== undefined) url.searchParams.set(chave, String(valor));
  }

  const resposta = await fetch(url, {
    method: metodo,
    ...(token ? { cache: "no-store" as const } : {}),
    signal,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (resposta.status === 204) return undefined as T;

  const json = (await resposta.json()) as ApiResposta<T>;

  if (!resposta.ok) {
    const motivo =
      json.errors
        ?.map((erro) => (typeof erro === "string" ? erro : erro.message))
        .filter(Boolean)
        .join(" ") ||
      json.message ||
      `A API respondeu com status ${resposta.status}.`;

    throw new ErroApi(motivo, resposta.status);
  }

  return json.data;
}
