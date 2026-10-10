type Validacao<T> = { dados: T; erro?: never } | { erro: string; dados?: never };
export type DadosPerfil = { nome: string; email: string; telefone: string; cidade: string; uf: string; bio: string };

const texto = (valor: unknown) => typeof valor === "string" ? valor : "";
const emailValido = (valor: string) => valor.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
const objeto = (entrada: unknown): Record<string, unknown> => entrada && typeof entrada === "object" ? entrada as Record<string, unknown> : {};

export function validarPerfil(entrada: unknown): Validacao<DadosPerfil> {
  const valor = objeto(entrada);
  // CPF, IDs, perfis de acesso e contadores nunca são encaminhados.
  const dados = { nome: texto(valor.nome).trim(), email: texto(valor.email).trim(),
    telefone: texto(valor.telefone).trim(), cidade: texto(valor.cidade).trim(),
    uf: texto(valor.uf).trim().toUpperCase(), bio: texto(valor.bio).trim() };
  if (dados.nome.length < 3 || dados.nome.length > 100) return { erro: "Informe um nome de 3 a 100 caracteres." };
  if (!emailValido(dados.email)) return { erro: "Informe um e-mail válido." };
  if (dados.cidade.length < 2 || dados.cidade.length > 100) return { erro: "Informe uma cidade de 2 a 100 caracteres." };
  if (!/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(dados.uf)) return { erro: "Selecione uma UF válida." };
  if (dados.telefone.length > 30) return { erro: "O telefone deve ter até 30 caracteres." };
  if (dados.bio.length > 500) return { erro: "A apresentação deve ter até 500 caracteres." };
  return { dados };
}

export function validarRecuperacao(entrada: unknown): Validacao<{ email: string }> {
  const email = texto(objeto(entrada).email).trim();
  return emailValido(email) ? { dados: { email } } : { erro: "Informe um e-mail válido." };
}

export function validarRedefinicao(entrada: unknown): Validacao<{ token: string; novaSenha: string }> {
  const valor = objeto(entrada);
  const token = texto(valor.token);
  const novaSenha = texto(valor.novaSenha);
  if (!token || token.length > 512 || /[\s\u0000-\u001f\u007f]/.test(token)) return { erro: "Link de recuperação inválido. Solicite um novo link." };
  if (novaSenha.length > 128 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(novaSenha)) {
    return { erro: "Use de 8 a 128 caracteres, com maiúscula, minúscula, número e um símbolo @$!%*?&." };
  }
  if (novaSenha !== texto(valor.confirmarSenha)) return { erro: "As senhas não coincidem." };
  return { dados: { token, novaSenha } };
}
