export type Cadastro = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cidade: string;
  uf: string;
  senha: string;
};

type Validacao<T> = { dados: T; erro?: never } | { erro: string; dados?: never };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

export function validarCadastro(entrada: unknown): Validacao<Cadastro> {
  if (!entrada || typeof entrada !== "object") return { erro: "Dados de cadastro inválidos." };
  const valor = entrada as Record<string, unknown>;
  const dados = {
    nome: texto(valor.nome).trim(),
    email: texto(valor.email).trim(),
    cpf: texto(valor.cpf).replace(/\D/g, ""),
    telefone: texto(valor.telefone).replace(/\D/g, ""),
    cidade: texto(valor.cidade).trim(),
    uf: texto(valor.uf).trim().toUpperCase(),
    senha: texto(valor.senha),
  };

  if (dados.telefone && dados.telefone.length !== 10 && dados.telefone.length !== 11) {
    return { erro: "Informe o telefone com DDD, ex.: (69) 99999-0000." };
  }
  if (dados.senha !== texto(valor.confirmarSenha)) return { erro: "As senhas não coincidem." };
  if (valor.termos !== true) return { erro: "Você precisa aceitar os termos de uso e a política de privacidade." };
  return { dados };
}

export function lerLogin(entrada: unknown): { email: string; senha: string; lembrar: boolean } {
  const valor = entrada && typeof entrada === "object" ? entrada as Record<string, unknown> : {};
  return { email: texto(valor.email).trim(), senha: texto(valor.senha), lembrar: valor.lembrar === true };
}

export function destinoInterno(entrada: unknown): string {
  const fallback = "/";
  if (typeof entrada !== "string" || !entrada.startsWith("/") || /[\\\u0000-\u0020\u007f]/.test(entrada)) return fallback;
  const origem = "https://doai.invalid";
  try {
    const url = new URL(entrada, origem);
    return url.origin === origem ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export function opcoesCookieSessao(lembrar: boolean, producao: boolean) {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: "lax" as const,
    path: "/",
    ...(lembrar ? { maxAge: 7 * 24 * 60 * 60 } : {}),
  };
}
