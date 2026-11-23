import assert from "node:assert/strict";
import { test } from "node:test";
import { administradorAtivo, METRICAS_ADMIN, montarDashboardAdmin, montarGraficosAdmin, montarMetricasAdmin, montarSerieMensal } from "../lib/admin-metrics.ts";

const SNAPSHOT = { usuarios: 1251, ativos: 1200, itens: 6255, disponiveis: 3000, doados: 900, denuncias: 4, atualizado_em: "2026-11-22T12:00:00.000Z" };

test("monta os seis cards na ordem do painel com os contadores do snapshot", () => {
  const metricas = montarMetricasAdmin(SNAPSHOT);
  assert.deepEqual(metricas.map((metrica) => metrica.id), METRICAS_ADMIN.map((metrica) => metrica.id));
  assert.deepEqual(metricas.map((metrica) => metrica.total), [1251, 1200, 6255, 3000, 900, 4]);
  assert.equal(metricas[0].titulo, "Usuários cadastrados");
});

test("campos extras da resposta não chegam ao cliente", () => {
  const metricas = montarMetricasAdmin({ ...SNAPSHOT, cpf: "não deve sair do servidor" });
  for (const metrica of metricas) assert.deepEqual(Object.keys(metrica).sort(), ["descricao", "id", "titulo", "total"]);
});

test("zero real permanece zero", () => {
  const zerado = Object.fromEntries(METRICAS_ADMIN.map((metrica) => [metrica.id, 0]));
  assert.ok(montarMetricasAdmin(zerado).every((metrica) => metrica.total === 0));
});

test("contador inválido vira indisponível sem esconder os outros", () => {
  for (const invalido of [undefined, null, "15", -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const metricas = montarMetricasAdmin({ ...SNAPSHOT, denuncias: invalido });
    assert.equal(metricas.find((metrica) => metrica.id === "denuncias").total, null);
    assert.equal(metricas.find((metrica) => metrica.id === "usuarios").total, 1251);
  }
});

test("resposta ausente ou fora do formato deixa todos os cards indisponíveis", () => {
  for (const dados of [null, undefined, "erro", 42]) {
    assert.ok(montarMetricasAdmin(dados).every((metrica) => metrica.total === null));
  }
});

const DIVISOES = {
  itens_por_status: { DISPONIVEL: 4, RESERVADO: 1, AGUARDANDO_CONFIRMACAO: 0, DOADO: 2, CANCELADO: 1 },
  interesses_por_status: { PENDENTE: 5, ACEITO: 1, RECUSADO: 0, CANCELADO: 0, EXPIRADO: 2 },
  usuarios_por_situacao: { ATIVO: 8, SUSPENSO: 1, INATIVO: 1 },
  denuncias_por_status: { EM_ANALISE: 3, PROCEDENTE: 1, IMPROCEDENTE: 2 },
};

test("gráficos trazem cada parte na ordem do fluxo, com rótulo em português", () => {
  const graficos = montarGraficosAdmin({ ...SNAPSHOT, ...DIVISOES });
  assert.deepEqual(graficos.map((grafico) => grafico.id), ["itens_por_status", "interesses_por_status", "usuarios_por_situacao", "denuncias_por_status"]);
  const itens = graficos[0].partes;
  assert.deepEqual(itens.map((parte) => parte.rotulo), ["Disponíveis", "Reservados", "Aguardando confirmação", "Doados", "Cancelados"]);
  assert.deepEqual(itens.map((parte) => parte.total), [4, 1, 0, 2, 1]);
});

test("parte inválida deixa só aquele gráfico indisponível, para não mostrar proporção errada", () => {
  for (const invalido of [undefined, "3", -1, 1.5, NaN]) {
    const graficos = montarGraficosAdmin({ ...DIVISOES, denuncias_por_status: { ...DIVISOES.denuncias_por_status, PROCEDENTE: invalido } });
    assert.equal(graficos.find((grafico) => grafico.id === "denuncias_por_status").partes, null);
    assert.notEqual(graficos.find((grafico) => grafico.id === "itens_por_status").partes, null);
  }
  assert.ok(montarGraficosAdmin(null).every((grafico) => grafico.partes === null));
  assert.ok(montarGraficosAdmin({ itens_por_status: [4, 1] }).every((grafico) => grafico.partes === null));
});

test("estados extras enviados pela API não entram no gráfico", () => {
  const graficos = montarGraficosAdmin({ ...DIVISOES, usuarios_por_situacao: { ...DIVISOES.usuarios_por_situacao, BANIDO: 99 } });
  assert.deepEqual(graficos[2].partes.map((parte) => parte.chave), ["ATIVO", "SUSPENSO", "INATIVO"]);
});

test("cada gráfico de distribuição tem um formato diferente", () => {
  assert.deepEqual(montarGraficosAdmin(DIVISOES).map((grafico) => grafico.tipo), ["colunas", "barras", "rosca", "segmentado"]);
});

const SERIE = [
  { mes: "2025-12", usuarios: 0, itens: 3 },
  { mes: "2026-01", usuarios: 2, itens: 5 },
  { mes: "2026-02", usuarios: 1, itens: 0 },
];

test("série mensal ganha rótulo curto em português, com o ano só em janeiro", () => {
  const serie = montarSerieMensal({ novos_por_mes: SERIE });
  assert.deepEqual(serie.map((mes) => mes.rotulo), ["dez", "jan/26", "fev"]);
  assert.deepEqual(serie.map((mes) => [mes.usuarios, mes.itens]), [[0, 3], [2, 5], [1, 0]]);
});

test("série mensal ausente ou com qualquer linha inválida fica indisponível", () => {
  for (const novos_por_mes of [undefined, null, [], "2026-01", Array.from({ length: 25 }, () => SERIE[0])]) {
    assert.equal(montarSerieMensal({ novos_por_mes }), null);
  }
  for (const linha of [{ ...SERIE[0], mes: "2026-13" }, { ...SERIE[0], mes: "jan" }, { ...SERIE[0], itens: -1 }, { ...SERIE[0], usuarios: "2" }, null]) {
    assert.equal(montarSerieMensal({ novos_por_mes: [SERIE[1], linha] }), null);
  }
});

test("o dashboard junta cards, gráficos e série do mesmo snapshot", () => {
  const dashboard = montarDashboardAdmin({ ...SNAPSHOT, ...DIVISOES, novos_por_mes: SERIE });
  assert.equal(dashboard.metricas.length, 6);
  assert.equal(dashboard.graficos.length, 4);
  assert.equal(dashboard.serie.length, 3);
});

test("só administrador ativo acessa o painel", () => {
  assert.equal(administradorAtivo({ perfil: "ADMINISTRADOR", situacao: "ATIVO" }), true);
  assert.equal(administradorAtivo({ perfil: "ADMINISTRADOR", situacao: "SUSPENSO" }), false);
  assert.equal(administradorAtivo({ perfil: "USUARIO", situacao: "ATIVO" }), false);
  assert.equal(administradorAtivo(null), false);
});