import assert from "node:assert/strict";
import { test } from "node:test";
import { validarPerfil, validarRecuperacao, validarRedefinicao } from "../lib/perfil-validation.ts";

const perfil = { nome: " Maria Silva ", email: " maria@example.test ", telefone: "", cidade: " Vilhena ", uf: "ro", bio: "" };
test("edição envia só campos do perfil próprio, excluindo identidade e privilégios", () => {
  assert.deepEqual(validarPerfil({ ...perfil, _id: "outro", cpf: "123", perfil: "ADMINISTRADOR", situacao: "ATIVO", total_doacoes: 999 }).dados,
    { nome: "Maria Silva", email: "maria@example.test", telefone: "", cidade: "Vilhena", uf: "RO", bio: "" });
});
test("perfil rejeita dados ausentes, UF inválida e limites sem descartar opcionais vazios", () => {
  for (const entrada of [null, {}, { ...perfil, nome: "A" }, { ...perfil, cidade: "A" }, { ...perfil, email: "invalido" },
    { ...perfil, uf: "ZZ" }, { ...perfil, telefone: "1".repeat(31) }, { ...perfil, bio: "x".repeat(501) }]) {
    assert.equal(typeof validarPerfil(entrada).erro, "string");
  }
});
test("recuperação só transmite e-mail validado, sem campos nativos Better Auth", () => {
  assert.deepEqual(validarRecuperacao({ email: " maria@example.test ", redirectTo: "https://evil.test" }).dados, { email: "maria@example.test" });
  assert.equal(typeof validarRecuperacao({ email: "inválido" }).erro, "string");
});
test("reset traduz apenas token/novaSenha e exige confirmação e política vigente", () => {
  const entrada = { token: "qa-token", novaSenha: "NovaSenha123!", confirmarSenha: "NovaSenha123!", userId: "outra-conta", callbackURL: "https://evil.test" };
  assert.deepEqual(validarRedefinicao(entrada).dados, { token: "qa-token", novaSenha: "NovaSenha123!" });
  for (const alteracao of [{ token: "" }, { token: "token com espaço" }, { token: "x".repeat(513) }, { novaSenha: "fraca" },
    { novaSenha: "Senha123#" }, { novaSenha: "x".repeat(129) }, { confirmarSenha: "OutraSenha123!" }]) {
    assert.equal(typeof validarRedefinicao({ ...entrada, ...alteracao }).erro, "string");
  }
});
