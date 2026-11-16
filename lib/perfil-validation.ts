type Validacao<T> = { dados: T; erro?: never } | { erro: string; dados?: never };
export type DadosPerfil = { nome: string; email: string; telefone: string; cidade: string; uf: string; bio: string };

const texto = (valor: unknown) => typeof valor === "string" ? valor : "";
const objeto = (entrada: unknown): Record<string, unknown> => entrada && typeof entrada === "object" ? entrada as Record<string, unknown> : {};


export function lerPerfil(entrada: unknown): DadosPerfil {
  const valor = objeto(entrada);
  
  return { nome: texto(valor.nome).trim(), email: texto(valor.email).trim(),
    telefone: texto(valor.telefone).trim(), cidade: texto(valor.cidade).trim(),
    uf: texto(valor.uf).trim().toUpperCase(), bio: texto(valor.bio).trim() };
}

export function lerRecuperacao(entrada: unknown): { email: string } {
  return { email: texto(objeto(entrada).email).trim() };
}

export function validarRedefinicao(entrada: unknown): Validacao<{ token: string; novaSenha: string }> {
  const valor = objeto(entrada);
  const token = texto(valor.token);
  const novaSenha = texto(valor.novaSenha);
  if (!token || token.length > 512 || /[\s\u0000-\u001f\u007f]/.test(token)) return { erro: "Link de recuperação inválido. Solicite um novo link." };
  if (novaSenha !== texto(valor.confirmarSenha)) return { erro: "As senhas não coincidem." };
  return { dados: { token, novaSenha } };
}
