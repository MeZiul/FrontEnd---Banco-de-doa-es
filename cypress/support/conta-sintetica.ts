// Massa exclusiva de QA local: nenhum cadastro depende do seed ou de dados pessoais.
export function criarContaSintetica() {
  const digitos = Array.from({ length: 9 }, () => Cypress._.random(0, 9));
  if (digitos.every((digito) => digito === digitos[0])) digitos[0] = (digitos[0] + 1) % 10;
  for (const fator of [10, 11]) {
    const soma = digitos.reduce((total, digito, indice) => total + digito * (fator - indice), 0);
    const resto = soma % 11;
    digitos.push(resto < 2 ? 0 : 11 - resto);
  }
  return {
    nome: "Maria QA Cypress",
    email: `qa.${Date.now()}.${crypto.randomUUID()}@example.test`,
    cpf: digitos.join(""),
    telefone: "69999990000",
    cidade: "Vilhena",
    uf: "RO",
    senha: "Senha@123",
  };
}

// Nunca usar a origem do frontend ou uma URL remota para criar massa de testes.
export const API_LOCAL = "http://127.0.0.1:7340";
