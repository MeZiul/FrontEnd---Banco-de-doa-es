import assert from "node:assert/strict";
import { test } from "node:test";
import { destinoInterno, opcoesCookieSessao, validarCadastro, validarLogin } from "../lib/auth-validation.ts";

const cadastro = {
  nome: " Maria da Silva ", email: " maria@example.test ", cpf: "529.982.247-25",
  telefone: "11999999999", cidade: " São Paulo ", uf: "sp", senha: "Teste123!",
  confirmarSenha: "Teste123!", termos: true,
};

test("cadastro gera somente o contrato público, sem confirmação, termos ou campos injetados", () => {
  const resultado = validarCadastro({ ...cadastro, perfil: "ADMINISTRADOR", situacao: "ATIVO" });
  assert.deepEqual(resultado.dados, {
    nome: "Maria da Silva", email: "maria@example.test", cpf: "52998224725",
    telefone: "11999999999", cidade: "São Paulo", uf: "SP", senha: "Teste123!",
  });
});

test("cadastro rejeita confirmação e aceite inválidos no servidor", () => {
  assert.match(validarCadastro({ ...cadastro, confirmarSenha: "Outra123!" }).erro, /coincidem/);
  for (const termos of [false, "true", "on", undefined]) {
    assert.match(validarCadastro({ ...cadastro, termos }).erro, /aceitar/);
  }
});

test("cadastro valida entradas ausentes, campos obrigatórios e política de senha real", () => {
  for (const entrada of [null, "cadastro", {}, { ...cadastro, nome: "A" },
    { ...cadastro, email: "inválido" }, { ...cadastro, cpf: "123" },
    { ...cadastro, cidade: "A" }, { ...cadastro, uf: "XX" },
    { ...cadastro, senha: "abcdefgh" }, { ...cadastro, senha: "Teste123#" },
    { ...cadastro, senha: "Teste123!".repeat(20) }]) {
    assert.equal(typeof validarCadastro(entrada).erro, "string");
  }
});

test("login traduz senha sem normalizá-la e exige booleano para lembrar", () => {
  assert.deepEqual(validarLogin({ email: " maria@example.test ", senha: " senha com espaços ", lembrar: "true" }).dados,
    { email: "maria@example.test", senha: " senha com espaços ", lembrar: false });
  assert.equal(validarLogin({ email: "maria@example.test", senha: "x", lembrar: true }).dados.lembrar, true);
  for (const entrada of [null, {}, { email: "inválido", senha: "x" }, { email: "a@b.test", senha: "" }]) {
    assert.equal(typeof validarLogin(entrada).erro, "string");
  }
});

test("redirecionamento permite caminhos internos e rejeita destinos externos e barras invertidas", () => {
  assert.equal(destinoInterno("/perfil?aba=meus-anuncios#itens"), "/perfil?aba=meus-anuncios#itens");
  for (const destino of [undefined, 5, "https://evil.test", "//evil.test", "/\\evil.test", "/\nevil.test", "javascript:alert(1)"]) {
    assert.equal(destinoInterno(destino), "/itens-doacao");
  }
});

test("cookie é HttpOnly e de sessão por padrão; lembrar persiste no máximo sete dias", () => {
  assert.deepEqual(opcoesCookieSessao(false, false), { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
  assert.deepEqual(opcoesCookieSessao(true, true), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 604800 });
});
