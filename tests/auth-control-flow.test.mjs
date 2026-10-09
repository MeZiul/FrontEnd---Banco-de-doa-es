import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { redirect, unstable_rethrow } = require("next/navigation");
const browser = require("next/dist/client/components/unstable-rethrow.browser");

for (const [ambiente, rethrow] of [["público", unstable_rethrow], ["browser", browser.unstable_rethrow]]) {
test(`${ambiente}: redirect de sucesso permanece sob controle do Next antes do feedback de erro`, () => {
  let mensagem;
  let erroRedirect;
  try {
    redirect("/login?cadastro=sucesso");
  } catch (erro) {
    erroRedirect = erro;
  }
  assert.ok(erroRedirect);
  assert.throws(() => {
    try {
      throw erroRedirect;
    } catch (erro) {
      rethrow(erro);
      mensagem = "Falha";
    }
  }, (erro) => erro === erroRedirect);
  assert.equal(mensagem, undefined);
});

test(`${ambiente}: falha comum de transporte continua permitindo feedback recuperável`, () => {
  let mensagem;
  try {
    throw new TypeError("Falha de conexão");
  } catch (erro) {
    rethrow(erro);
    mensagem = "Tente novamente.";
  }
  assert.equal(mensagem, "Tente novamente.");
});
}
