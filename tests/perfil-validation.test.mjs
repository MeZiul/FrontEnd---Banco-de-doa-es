import assert from "node:assert/strict";
import { test } from "node:test";
import { lerPerfil, lerRecuperacao, validarRedefinicao } from "../lib/perfil-validation.ts";

const perfil = { nome: " Maria Silva ", email: " maria@example.test ", telefone: "", cidade: " Vilhena ", uf: "ro", bio: "" };
test("edição envia só campos do perfil próprio, excluindo identidade e privilégios", () => {
  assert.deepEqual(lerPerfil({ ...perfil, _id: "outro", cpf: "123", perfil: "ADMINISTRADOR", situacao: "ATIVO", total_doacoes: 999 }),
    { nome: "Maria Silva", email: "maria@example.test", telefone: "", cidade: "Vilhena", uf: "RO", bio: "" });
});
test("perfil sem dados vira campos vazios para o Zod da API recusar", () => {
  assert.deepEqual(lerPerfil(null), { nome: "", email: "", telefone: "", cidade: "", uf: "", bio: "" });
});
test("recuperação só transmite o e-mail, sem campos nativos Better Auth", () => {
  assert.deepEqual(lerRecuperacao({ email: " maria@example.test ", redirectTo: "https://evil.test" }), { email: "maria@example.test" });
});
test("reset traduz apenas token/novaSenha e exige token válido e confirmação", () => {
  const entrada = { token: "qa-token", novaSenha: "NovaSenha123!", confirmarSenha: "NovaSenha123!", userId: "outra-conta", callbackURL: "https://evil.test" };
  assert.deepEqual(validarRedefinicao(entrada).dados, { token: "qa-token", novaSenha: "NovaSenha123!" });
  for (const alteracao of [{ token: "" }, { token: "token com espaço" }, { token: "x".repeat(513) }, { confirmarSenha: "OutraSenha123!" }]) {
    assert.equal(typeof validarRedefinicao({ ...entrada, ...alteracao }).erro, "string");
  }
});
test("reset deixa a força da senha para o Zod da API", () => {
  assert.equal(validarRedefinicao({ token: "qa-token", novaSenha: "fraca", confirmarSenha: "fraca" }).erro, undefined);
});
