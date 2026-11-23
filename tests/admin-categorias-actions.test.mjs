import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/doacao-validation.ts";

// Executa as ações reais com a API isolada, sem credenciais nem banco.
const fonte = readFileSync(new URL("../app/(protected)/admin/categorias/actions.ts", import.meta.url), "utf8");
const compilado = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const categoriaId = "40000000-0000-0000-0000-000000000001";

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
  const formulario = (campos) => {
    const dados = new FormData();
    for (const [nome, valor] of Object.entries(campos)) dados.set(nome, valor);
    return dados;
  };
  const inicial = { sucesso: false, mensagem: "" };
  return {
    salvar: (campos) => contexto.exports.salvarCategoria(inicial, formulario(campos)),
    excluir: (campos) => contexto.exports.excluirCategoria(inicial, formulario(campos)),
    chamadas,
    revalidacoes,
  };
}

test("cria com POST, apara os campos e revalida a tela", async () => {
  const app = ambiente();
  const resultado = await app.salvar({ nome: "  Brinquedos ", descricao: " Para crianças ", ordem: "3", ativo: "on" });
  assert.equal(resultado.sucesso, true);
  assert.equal(app.chamadas[0].path, "categorias");
  assert.equal(app.chamadas[0].opcoes.metodo, "POST");
  assert.deepEqual({ ...app.chamadas[0].opcoes.body }, { nome: "Brinquedos", descricao: "Para crianças", ordem: 3, ativo: true });
  assert.deepEqual(app.revalidacoes, ["/admin/categorias"]);
});

test("edita com PUT no id e checkbox desmarcado desativa", async () => {
  const app = ambiente();
  assert.equal((await app.salvar({ id: categoriaId, nome: "Roupas", ordem: "" })).sucesso, true);
  assert.equal(app.chamadas[0].path, `categorias/${categoriaId}`);
  assert.equal(app.chamadas[0].opcoes.metodo, "PUT");
  assert.equal(app.chamadas[0].opcoes.body.ativo, false);
  assert.equal(app.chamadas[0].opcoes.body.ordem, 0);
});

test("dados inválidos não chegam à API", async () => {
  for (const campos of [
    { nome: "A" },
    { nome: "x".repeat(61) },
    { nome: "Roupas", ordem: "-1" },
    { nome: "Roupas", ordem: "1.5" },
    { nome: "Roupas", descricao: "x".repeat(301) },
    { id: "../usuarios", nome: "Roupas" },
  ]) {
    const app = ambiente();
    assert.equal((await app.salvar(campos)).sucesso, false);
    assert.equal(app.chamadas.length, 0);
  }
});

test("mostra a mensagem da API quando o nome já existe", async () => {
  const app = ambiente({ falha: (ErroApi) => new ErroApi("Já existe uma categoria com este nome.", 409) });
  const resultado = await app.salvar({ nome: "Roupas" });
  assert.equal(resultado.mensagem, "Já existe uma categoria com este nome.");
  assert.deepEqual(app.revalidacoes, []);
});

test("exclui com DELETE e explica o conflito de categoria em uso", async () => {
  const ok = ambiente();
  assert.equal((await ok.excluir({ id: categoriaId })).sucesso, true);
  assert.equal(ok.chamadas[0].opcoes.metodo, "DELETE");

  const emUso = ambiente({ falha: (ErroApi) => new ErroApi("Conflito", 409) });
  assert.match((await emUso.excluir({ id: categoriaId })).mensagem, /Desative-a/);

  const invalido = ambiente();
  assert.equal((await invalido.excluir({ id: "" })).sucesso, false);
  assert.equal(invalido.chamadas.length, 0);
});
