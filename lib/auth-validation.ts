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

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarCadastro(entrada: unknown): Validacao<Cadastro> {
  if (!entrada || typeof entrada !== "object") return { erro: "Dados de cadastro inválidos." };
  const valor = entrada as Record<string, unknown>;
  const dados = {
    nome: texto(valor.nome).trim(),
    email: texto(valor.email).trim(),
    cpf: texto(valor.cpf).replace(/\D/g, ""),
    telefone: texto(valor.telefone).trim(),
    cidade: texto(valor.cidade).trim(),
    uf: texto(valor.uf).trim().toUpperCase(),
    senha: texto(valor.senha),
  };
  if (dados.nome.length < 3) return { erro: "Nome deve ter no mínimo 3 caracteres." };
  if (!emailValido(dados.email)) return { erro: "Informe um e-mail válido." };
  if (dados.cpf.length !== 11) return { erro: "Informe um CPF com 11 dígitos." };
  if (dados.cidade.length < 2) return { erro: "Informe sua cidade." };
  if (!/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(dados.uf)) {
    return { erro: "Selecione uma UF válida." };
  }
  if (dados.senha.length > 128 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(dados.senha)) {
    return { erro: "Use de 8 a 128 caracteres, com maiúscula, minúscula, número e um símbolo @$!%*?&." };
  }
  if (dados.senha !== texto(valor.confirmarSenha)) return { erro: "As senhas não coincidem." };
  if (valor.termos !== true) return { erro: "Você precisa aceitar os termos de uso e a política de privacidade." };
  return { dados };
}

export function validarLogin(entrada: unknown): Validacao<{ email: string; senha: string; lembrar: boolean }> {
  if (!entrada || typeof entrada !== "object") return { erro: "Dados de login inválidos." };
  const valor = entrada as Record<string, unknown>;
  const email = texto(valor.email).trim();
  const senha = texto(valor.senha);
  if (!emailValido(email) || !senha) return { erro: "Informe e-mail e senha válidos." };
  return { dados: { email, senha, lembrar: valor.lembrar === true } };
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
