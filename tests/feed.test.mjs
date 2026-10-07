import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Execute the real TypeScript helpers and API adapter. Only HTTP and the
// environment are controlled; fixtures never enter the application's runtime.
function loadFeed(fetchImpl, { apiUrl = "http://localhost:7340", timeout = AbortSignal.timeout } = {}) {
  const context = vm.createContext({
    URL, URLSearchParams,
    AbortSignal: { timeout },
    process: { env: { NEXT_PUBLIC_API_URL: apiUrl } },
    fetch: fetchImpl,
  });
  const modules = new Map();
  function load(relativePath) {
    if (modules.has(relativePath)) return modules.get(relativePath);
    const source = readFileSync(new URL(`../${relativePath}.ts`, import.meta.url), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const loadedModule = { exports: {} };
    const run = vm.runInContext(`(function(require, module, exports) { ${output}\n})`, context);
    run(name => {
      if (!name.startsWith("@/")) throw new Error(`Unexpected import: ${name}`);
      return load(name.slice(2));
    }, loadedModule, loadedModule.exports);
    modules.set(relativePath, loadedModule.exports);
    return loadedModule.exports;
  }
  return load("lib/feed");
}

const response = (data, status = 200) => ({
  status, ok: status >= 200 && status < 300,
  json: async () => ({ message: status === 200 ? "OK" : "Serviço indisponível", data, errors: [] }),
});
const categoriaId = "12345678-1234-1234-1234-123456789abc";

test("shared URLs restore combined filters and change only the requested page", () => {
  const feed = loadFeed();
  const filtros = feed.lerFiltros({
    busca: " Mesa & cadeira ", categoria_id: categoriaId, cidade: " Cuiabá ",
    uf: "mt", condicao_item: "USADO_BOM", ordenacao: "interessados", page: "2",
  });
  const url = new URL(feed.urlFeed(filtros, 3), "http://frontend.local");
  const restored = feed.lerFiltros(Object.fromEntries(url.searchParams));
  assert.equal(restored.busca, "Mesa & cadeira");
  assert.equal(restored.cidade, "Cuiabá");
  assert.equal(restored.uf, "MT");
  assert.equal(restored.categoria_id, categoriaId);
  assert.equal(restored.condicao_item, "USADO_BOM");
  assert.equal(restored.ordenacao, "interessados");
  assert.equal(restored.page, 3);
  assert.equal(filtros.page, 2);
});

test("untrusted query values cannot inject filters or prototype properties", () => {
  const feed = loadFeed();
  for (const page of ["0", "-1", "1.5", "1e3", "Infinity", "9007199254740992", ["1", "2"]]) {
    assert.equal(feed.lerFiltros({ page }).page, 1);
  }
  const filtros = feed.lerFiltros({
    busca: ["a", "b"], categoria_id: "invalid", uf: "XX",
    condicao_item: "constructor", ordenacao: "toString", status: "DOADO",
  });
  assert.equal(filtros.busca, "");
  assert.equal(filtros.categoria_id, "");
  assert.equal(filtros.uf, "");
  assert.equal(filtros.condicao_item, "");
  assert.equal(filtros.ordenacao, "recentes");
  assert.equal("status" in filtros, false);
  assert.equal(feed.lerFiltros({ categoria_id: "507f1f77bcf86cd799439011" }).categoria_id, "507f1f77bcf86cd799439011");
});

test("public feed sends supported combined filters without authorization", async () => {
  const calls = [];
  const payload = { docs: [], totalDocs: 0, page: 4 };
  const feed = loadFeed(async (url, options) => { calls.push({ url, options }); return response(payload); });
  const result = await feed.listarFeed(feed.lerFiltros({
    busca: "roupas", categoria_id: categoriaId, cidade: "Vilhena", uf: "ro",
    condicao_item: "NOVO", ordenacao: "recentes", page: "4", status: "DOADO",
  }));
  assert.equal(result, payload);
  assert.equal(calls.length, 1);
  const { url, options } = calls[0];
  assert.equal(url.pathname, "/itemdoacao");
  assert.equal(url.searchParams.get("categoria_id"), categoriaId);
  assert.equal(url.searchParams.get("busca"), "roupas");
  assert.equal(url.searchParams.get("cidade"), "Vilhena");
  assert.equal(url.searchParams.get("uf"), "RO");
  assert.equal(url.searchParams.get("condicao_item"), "NOVO");
  assert.equal(url.searchParams.get("page"), "4");
  assert.equal(url.searchParams.get("limit"), "20");
  assert.equal(url.searchParams.has("status"), false);
  assert.equal(url.searchParams.has("categoriaId"), false);
  assert.equal(options.method, "GET");
  assert.equal(options.headers.Authorization, undefined);
});

test("category options include every page using the category limite contract", async () => {
  const calls = [];
  const feed = loadFeed(async (url, options) => {
    calls.push({ url, options });
    const page = Number(url.searchParams.get("page"));
    return response({ docs: [{ _id: String(page), nome: `Categoria ${page}` }], hasNextPage: page < 3 });
  });
  const categorias = await feed.listarCategoriasFeed();
  assert.equal(categorias.map(c => c.nome).join(","), "Categoria 1,Categoria 2,Categoria 3");
  assert.equal(calls.length, 3);
  for (const { url, options } of calls) {
    assert.equal(url.pathname, "/categorias");
    assert.equal(url.searchParams.get("limite"), "100");
    assert.equal(url.searchParams.has("limit"), false);
    assert.equal(options.headers.Authorization, undefined);
  }
});

test("API failure is propagated rather than represented as an empty successful feed", async () => {
  const feed = loadFeed(async () => response(null, 503));
  await assert.rejects(feed.listarFeed(feed.lerFiltros({})), error => error.status === 503);
  await assert.rejects(feed.listarCategoriasFeed(), error => error.status === 503);
});

test("a later category page failure rejects incomplete options", async () => {
  let requests = 0;
  const feed = loadFeed(async () => ++requests === 1
    ? response({ docs: [{ _id: "1", nome: "Parcial" }], hasNextPage: true })
    : response(null, 503));
  await assert.rejects(feed.listarCategoriasFeed(), error => error.status === 503);
  assert.equal(requests, 2);
});

test("slow HTTP requests are bounded and propagate timeout for the error UI", async () => {
  const limits = [];
  const feed = loadFeed(async (_url, { signal }) => {
    await new Promise(resolve => setTimeout(resolve, 15));
    signal.throwIfAborted();
    return response({ docs: [], hasNextPage: false });
  }, { timeout: milliseconds => { limits.push(milliseconds); return AbortSignal.timeout(1); } });
  await assert.rejects(feed.listarFeed(feed.lerFiltros({})), error => error.name === "TimeoutError");
  await assert.rejects(feed.listarCategoriasFeed(), error => error.name === "TimeoutError");
  assert.deepEqual(limits, [10000, 10000]);
});

test("photos resolve only to API uploads and reject absent, foreign or traversing sources", () => {
  const feed = loadFeed();
  const item = url => ({ fotos: [{ url }] });
  assert.equal(feed.fotoFeed(item("/uploads/itens/photo.png")), "http://localhost:7340/uploads/itens/photo.png");
  assert.equal(feed.fotoFeed(item("http://localhost:7340/uploads/itens/photo.webp")), "http://localhost:7340/uploads/itens/photo.webp");
  for (const url of [
    "https://foreign.example/uploads/itens/photo.png", "//foreign.example/uploads/itens/photo.png",
    "javascript:alert(1)", "data:image/png;base64,AAAA", "/uploads/itens/../../private",
    "/uploads/itens/%2e%2e/private", "/uploads/other/photo.png",
  ]) assert.equal(feed.fotoFeed(item(url)), undefined, url);
  assert.equal(feed.fotoFeed({ fotos: [] }), undefined);
  assert.equal(feed.fotoFeed({}), undefined);
  assert.equal(loadFeed(undefined, { apiUrl: "invalid" }).fotoFeed(item("/uploads/itens/photo.png")), undefined);
});
