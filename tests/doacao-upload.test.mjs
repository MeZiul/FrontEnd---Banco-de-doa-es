import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const id = "20000000-0000-0000-0000-000000000001";
function ambiente({ token = "sessao-sintetica", situacao = "ATIVO" } = {}) {
  const chamadas = [];
  function modulo(path, require) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const contexto = { exports: {}, require, URL, File, Response, FormData, Uint8Array, AbortSignal, process: { env: { NEXT_PUBLIC_API_URL: "http://api.local" } }, fetch: async (url, options) => {
      chamadas.push({ url, options });
      return Response.json({ fotos: [], mensagem: "Foto adicionada" });
    } };
    vm.runInNewContext(code, contexto); return contexto.exports;
  }
  const validation = modulo("lib/doacao-validation.ts", name => {
    if (name === "@/lib/feed") return { UFS: ["RO"] };
    if (name === "@/types/feed") return { CONDICOES: { NOVO: "Novo" } };
    throw new Error(name);
  });
  class ErroApi extends Error {}
  const route = modulo("app/api/doacoes/[id]/fotos/route.ts", name => {
    if (name === "next/cache") return { revalidatePath() {} };
    if (name === "@/lib/api") return { ErroApi, fetchApi: async () => ({ situacao }) };
    if (name === "@/lib/auth-server") return { getToken: async () => token };
    if (name === "@/lib/doacao-validation") return validation;
    throw new Error(name);
  });
  return { executar: request => route.POST(request, { params: Promise.resolve({ id }) }), chamadas };
}
function pedido({ origin = "http://127.0.0.1:5182", file = new File(["imagem"], "qa.png", { type: "image/png" }), extra = false } = {}) {
  const body = new FormData(); body.append("fotos", file); if (extra) body.append("usuario_id", "outro");
  return new Request(`http://localhost:5182/api/doacoes/${id}/fotos`, { method: "POST", headers: { host: "127.0.0.1:5182", ...(origin ? { origin } : {}) }, body });
}
test("CSRF rejeita origem ausente ou externa mesmo com cookie de sessão", async () => {
  for (const origin of ["", "https://ataque.local", "http://127.0.0.1:9999"]) {
    const app = ambiente(); assert.equal((await app.executar(pedido({ origin }))).status, 403); assert.equal(app.chamadas.length, 0);
  }
});
test("Host original permite navegador127 apesar do URL localhost normalizado pelo Next", async () => {
  const app = ambiente(); const response = await app.executar(pedido());
  assert.equal(response.status, 200); assert.equal((await response.json()).sucesso, true);
  assert.equal(app.chamadas.length, 1);
  assert.equal(app.chamadas[0].options.headers.Authorization, "Bearer sessao-sintetica");
  assert.equal(app.chamadas[0].options.body.getAll("fotos").length, 1);
});
test("sessão ausente ou conta inativa bloqueia envio à API de imagens", async () => {
  for (const options of [{ token: undefined }, { situacao: "SUSPENSO" }]) {
    const app = ambiente(options.token === undefined && Object.hasOwn(options, "token") ? { token: null } : options);
    assert.equal((await app.executar(pedido())).status, options.situacao ? 403 : 401); assert.equal(app.chamadas.length, 0);
  }
});
test("multipart rejeita campo extra e SVG antes do envio à API", async () => {
  for (const options of [{ extra: true }, { file: new File(["svg"], "qa.svg", { type: "image/svg+xml" }) }]) {
    const app = ambiente(); assert.equal((await app.executar(pedido(options))).status, 400); assert.equal(app.chamadas.length, 0);
  }
});
test("corpo chunked acima do limite é interrompido antes de parsear multipart", async () => {
  const app = ambiente();
  const request = new Request(`http://localhost:5182/api/doacoes/${id}/fotos`, { method: "POST", headers: { origin: "http://127.0.0.1:5182", host: "127.0.0.1:5182", "content-type": "multipart/form-data; boundary=qa" }, body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(4 * 1024 * 1024 + 65537)); controller.close(); } }), duplex: "half" });
  assert.equal((await app.executar(request)).status, 413); assert.equal(app.chamadas.length, 0);
});
