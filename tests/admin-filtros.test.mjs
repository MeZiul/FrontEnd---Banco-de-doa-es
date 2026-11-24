import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Carrega lib/admin-filtros.ts resolvendo o alias "@/lib/status-item".
function carregar(caminho, modulos) {
  const fonte = readFileSync(new URL(caminho, import.meta.url), "utf8");
  const js = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const contexto = { exports: {}, require: (nome) => modulos[nome] ?? {} };
  vm.runInNewContext(js, contexto);
  return contexto.exports;
}
const statusItem = carregar("../lib/status-item.ts", {});
const filtros = carregar("../lib/admin-filtros.ts", { "@/lib/status-item": statusItem });

test("mantém só filtros conhecidos, com opção válida e texto aparado", () => {
  const resultado = filtros.filtrosValidos(filtros.FILTROS_USUARIOS, {
    nome: "  Maria ",
    email: "maria@",
    situacao: "SUSPENSO",
    perfil: "ROOT",
    cpf: "123",
    pagina: "2",
  });
  assert.deepEqual({ ...resultado }, { nome: "Maria", email: "maria@", situacao: "SUSPENSO" });
});

test("ignora vazios, não-texto e corta texto longo", () => {
  const resultado = filtros.filtrosValidos(filtros.FILTROS_ITENS, { busca: "x".repeat(150), status: ["DOADO"] });
  assert.deepEqual({ ...resultado }, { busca: "x".repeat(100) });
  assert.deepEqual({ ...filtros.filtrosValidos(filtros.FILTROS_DENUNCIAS, { status: "", motivo: "   " }) }, {});
});

test("cada tela usa os parâmetros pedidos na task", () => {
  // Copia para um array deste contexto (o do vm tem outro protótipo).
  const nomes = (campos) => [...campos].map((campo) => campo.nome);
  assert.deepEqual(nomes(filtros.FILTROS_USUARIOS), ["nome", "email", "situacao", "perfil"]);
  assert.deepEqual(nomes(filtros.FILTROS_DENUNCIAS), ["status", "tipo_alvo", "motivo"]);
  assert.deepEqual(nomes(filtros.FILTROS_AUDITORIA), ["tipo_acao", "tipo_alvo"]);
  assert.deepEqual(nomes(filtros.FILTROS_ITENS), ["busca", "status"]);
  assert.ok(filtros.FILTROS_ITENS[1].opcoes.some((opcao) => opcao.valor === "CANCELADO"));
});