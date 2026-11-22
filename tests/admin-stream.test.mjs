import assert from "node:assert/strict";
import { test } from "node:test";
import { repassarStreamMetricas } from "../lib/admin-stream.ts";

const API = "http://api.interna:7340/";

function corpoSse(texto) {
  return new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(texto)); controller.close(); } });
}

function cenario({ token = "token-admin", sessao = true, resposta, falha } = {}) {
  const chamadas = [];
  const erros = [];
  const consoleError = console.error;
  console.error = (...args) => erros.push(args);
  const executar = (sinal = new AbortController().signal) => repassarStreamMetricas({
    token,
    sessaoValida: async () => { if (sessao instanceof Error) throw sessao; return sessao; },
    apiUrl: API,
    sinal,
    buscar: async (url, opcoes) => {
      chamadas.push({ url: String(url), opcoes });
      if (falha) throw falha;
      return resposta ?? new Response(corpoSse("event: metricas\ndata: {\"usuarios\":1}\n\n"), { status: 200, headers: { "Content-Type": "text/event-stream" } });
    },
  }).finally(() => { console.error = consoleError; });
  return { executar, chamadas, erros };
}

test("sem token ou com sessão inválida responde 401 sem chamar a API", async () => {
  for (const opcoes of [{ token: "" }, { sessao: false }]) {
    const app = cenario(opcoes);
    const resposta = await app.executar();
    assert.equal(resposta.status, 401);
    assert.equal(app.chamadas.length, 0);
  }
});

test("repassa o stream do back com Bearer e headers anti-buffer", async () => {
  const app = cenario();
  const controle = new AbortController();
  const resposta = await app.executar(controle.signal);

  assert.equal(resposta.status, 200);
  assert.equal(app.chamadas[0].url, "http://api.interna:7340/admin/metricas/stream");
  assert.equal(app.chamadas[0].opcoes.headers.Authorization, "Bearer token-admin");
  assert.equal(app.chamadas[0].opcoes.cache, "no-store");
  assert.equal(app.chamadas[0].opcoes.signal, controle.signal);
  assert.match(resposta.headers.get("content-type"), /^text\/event-stream/);
  assert.equal(resposta.headers.get("cache-control"), "no-cache, no-transform");
  assert.equal(resposta.headers.get("x-accel-buffering"), "no");
  assert.equal(await resposta.text(), "event: metricas\ndata: {\"usuarios\":1}\n\n");
});

test("traduz as recusas do back sem expor a mensagem dele", async () => {
  for (const [statusBack, esperado] of [[498, 401], [401, 401], [403, 403], [429, 429], [500, 502], [404, 502]]) {
    const app = cenario({ resposta: Response.json({ message: "detalhe interno" }, { status: statusBack }) });
    const resposta = await app.executar();
    assert.equal(resposta.status, esperado);
    assert.doesNotMatch(await resposta.text(), /detalhe interno/);
  }
});

test("back fora do ar ou falha ao validar a sessão responde 502 e registra o erro", async () => {
  for (const opcoes of [{ falha: new TypeError("fetch failed") }, { sessao: new Error("sessão indisponível") }]) {
    const app = cenario(opcoes);
    const resposta = await app.executar();
    assert.equal(resposta.status, 502);
    assert.equal(app.erros.length, 1);
  }
});

test("navegador que desistiu antes da resposta não gera log de erro", async () => {
  const controle = new AbortController();
  controle.abort();
  const app = cenario({ falha: new DOMException("aborted", "AbortError") });
  const resposta = await app.executar(controle.signal);
  assert.equal(resposta.status, 502);
  assert.equal(app.erros.length, 0);
});