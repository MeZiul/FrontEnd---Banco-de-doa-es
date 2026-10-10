import assert from "node:assert/strict";
import { test } from "node:test";
import { administradorAtivo, consultarMetricasAdmin, METRICAS_ADMIN } from "../lib/admin-metrics.ts";

test("usa totalDocs completo, limit=1 e filtros reais de cada contrato admin", async () => {
  const chamadas = [];
  const resultado = await consultarMetricasAdmin(async (caminho, params) => {
    chamadas.push({ caminho, params });
    return { totalDocs: 1251, docs: [{ cpf: "não deve sair do DAL" }] };
  }, () => {});
  assert.equal(resultado.length, 6);
  for (let i = 0; i < resultado.length; i++) {
    assert.equal(resultado[i].total, 1251);
    assert.deepEqual(chamadas[i], { caminho: METRICAS_ADMIN[i].caminho, params: { ...METRICAS_ADMIN[i].filtros, page: 1, limit: 1 } });
    assert.equal("docs" in resultado[i], false);
  }
});
test("zero real permanece zero e falha parcial não esconde outras contagens", async () => {
  const resultado = await consultarMetricasAdmin(async (caminho) => {
    if (caminho === "admin/denuncias") throw new Error("timeout");
    return { totalDocs: 0, docs: [] };
  }, () => {});
  assert.equal(resultado.at(-1).total, null);
  assert.ok(resultado.slice(0, -1).every((metrica) => metrica.total === 0));
});
test("resposta incompleta ou total inválido não pode se transformar em zero", async () => {
  for (const totalDocs of [undefined, null, "15", -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const resultado = await consultarMetricasAdmin(async () => ({ totalDocs, docs: [] }), () => {});
    assert.ok(resultado.every((metrica) => metrica.total === null));
  }
});
test("perda de autorização interrompe o resultado inteiro", async () => {
  const acesso = new Error("acesso revogado");
  await assert.rejects(consultarMetricasAdmin(async () => { throw acesso; }, (erro) => { throw erro; }), (erro) => erro === acesso);
});
test("guarda permite apenas administrador ativo", () => {
  assert.equal(administradorAtivo({ perfil: "ADMINISTRADOR", situacao: "ATIVO" }), true);
  for (const usuario of [null, undefined, {}, { perfil: "USUARIO", situacao: "ATIVO" },
    { perfil: "ADMINISTRADOR", situacao: "INATIVO" }, { perfil: "ADMINISTRADOR", situacao: "SUSPENSO" }]) {
    assert.equal(administradorAtivo(usuario), false);
  }
});
