import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/doacao-validation.ts";

// Executa a ação real com a API isolada, sem credenciais nem banco.
const fonte = readFileSync(new URL("../app/(protected)/admin/itens/actions.ts", import.meta.url), "utf8");
const compilado = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const itemId = "50000000-0000-0000-0000-000000000001";

function ambiente({ falha = null } = {}) {
  const chamadas = [];
  const revalidacoes = [];
  class ErroApi extends Error {
    constructor(mensagem, status) { super(mensagem); this.status = status; }
  }
  const contexto = {
    exports: {},
    require(nome) {
      if (nome === "next/cache") return { revalidatePath: (path) => revalidacoes.push(path) };
      if (nome === "next/navigation") return { unstable_rethrow: () => {} };
      if (nome === "@/lib/api") return { ErroApi };
      if (nome === "@/lib/doacao-validation") return validacao;
      if (nome === "@/lib/auth-server") return {
        fetchApiAutenticado: async (path, opcoes) => {
          chamadas.push({ path, opcoes });
          if (falha) throw falha(ErroApi);
          return {};
        },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  vm.runInNewContext(compilado, contexto);
  const cancelar = (campos) => {
    const dados = new FormData();
    for (const [nome, valor] of Object.entries(campos)) dados.set(nome, valor);
    return contexto.exports.cancelarItemAdmin({ sucesso: false, mensagem: "" }, dados);
  };
  return { cancelar, chamadas, revalidacoes };
}

test("cancela com PUT, envia o motivo aparado e revalida a tela", async () => {
  const app = ambiente();
  const resultado = await app.cancelar({ id: itemId, motivo: "  Anúncio fora das regras.  " });
  assert.equal(resultado.sucesso, true);
  assert.equal(app.chamadas[0].path, `admin/itens/${itemId}/cancelar`);
  assert.equal(app.chamadas[0].opcoes.metodo, "PUT");
  assert.deepEqual({ ...app.chamadas[0].opcoes.body }, { motivo: "Anúncio fora das regras." });
  assert.deepEqual(app.revalidacoes, ["/admin/itens"]);
});

test("motivo curto, longo ou id inválido não chegam à API", async () => {
  for (const campos of [
    { id: itemId, motivo: "" },
    { id: itemId, motivo: "   curto   " },
    { id: itemId, motivo: "x".repeat(2001) },
    { id: "../usuarios", motivo: "Anúncio fora das regras." },
  ]) {
    const app = ambiente();
    assert.equal((await app.cancelar(campos)).sucesso, false);
    assert.equal(app.chamadas.length, 0);
  }
});

test("mostra a mensagem da API quando o anúncio já foi cancelado", async () => {
  const app = ambiente({ falha: (ErroApi) => new ErroApi("O item já está cancelado.", 409) });
  const resultado = await app.cancelar({ id: itemId, motivo: "Anúncio fora das regras." });
  assert.deepEqual({ ...resultado }, { sucesso: false, mensagem: "O item já está cancelado." });
  assert.deepEqual(app.revalidacoes, []);
});
