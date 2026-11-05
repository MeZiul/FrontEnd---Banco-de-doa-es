import assert from "node:assert/strict";
import { test } from "node:test";
import { destinoInterno, lerLogin, opcoesCookieSessao, validarCadastro } from "../lib/auth-validation.ts";

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

test("cadastro rejeita entrada ausente e telefone sem DDD", () => {
  for (const entrada of [null, "cadastro", { ...cadastro, telefone: "9999-0000" }, { ...cadastro, telefone: "699999900001" }]) {
    assert.equal(typeof validarCadastro(entrada).erro, "string");
  }
});

test("cadastro aceita celular e fixo com máscara e guarda só os dígitos", () => {
  assert.equal(validarCadastro({ ...cadastro, telefone: "(69) 99999-0000" }).dados.telefone, "69999990000");
  assert.equal(validarCadastro({ ...cadastro, telefone: "(69) 3333-0000" }).dados.telefone, "6933330000");
  assert.equal(validarCadastro({ ...cadastro, telefone: "" }).dados.telefone, "");
});

test("cadastro deixa nome, e-mail, CPF, cidade, UF e senha para o Zod da API", () => {
  for (const entrada of [{ ...cadastro, nome: "A" }, { ...cadastro, email: "inválido" },
    { ...cadastro, cpf: "123" }, { ...cadastro, cidade: "A" }, { ...cadastro, uf: "XX" },
    { ...cadastro, senha: "abcdefgh", confirmarSenha: "abcdefgh" }]) {
    assert.equal(validarCadastro(entrada).erro, undefined);
  }
});

test("login traduz senha sem normalizá-la e exige booleano para lembrar", () => {
  assert.deepEqual(lerLogin({ email: " maria@example.test ", senha: " senha com espaços ", lembrar: "true" }),
    { email: "maria@example.test", senha: " senha com espaços ", lembrar: false });
  assert.equal(lerLogin({ email: "maria@example.test", senha: "x", lembrar: true }).lembrar, true);
  assert.deepEqual(lerLogin(null), { email: "", senha: "", lembrar: false });
});

test("redirecionamento permite caminhos internos e rejeita destinos externos e barras invertidas", () => {
  assert.equal(destinoInterno("/perfil?aba=meus-anuncios#itens"), "/perfil?aba=meus-anuncios#itens");
  for (const destino of [undefined, 5, "https://evil.test", "//evil.test", "/\\evil.test", "/\nevil.test", "javascript:alert(1)"]) {
    assert.equal(destinoInterno(destino), "/");
  }
});

test("cookie é HttpOnly e de sessão por padrão; lembrar persiste no máximo sete dias", () => {
  assert.deepEqual(opcoesCookieSessao(false, false), { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
  assert.deepEqual(opcoesCookieSessao(true, true), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 604800 });
});
