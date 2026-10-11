import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function carregar(path) {
  const chamadas = [];
  const contexto = { exports: {}, AbortSignal, require(nome) {
    if (nome === "next/navigation") return { unstable_rethrow: erro => { if (erro.redirect) throw erro; } };
    if (nome === "@/lib/auth-server") return { fetchApiAutenticado: async (route, options) => {
      chamadas.push({ route, options });
      const page = options.params.page ?? 1;
      return { docs: [{ _id: `registro-pagina-${page}` }], page, totalDocs: 10, totalPages: 2 };
    } };
    throw new Error(`Import inesperado: ${nome}`);
  } };
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, contexto);
  return { exports: contexto.exports, chamadas };
}

for (const [file, action, route] of [
  ["../app/(protected)/admin/usuarios/actions.ts", "listarUsuarios", "admin/usuarios"],
  ["../app/(protected)/admin/denuncias/actions.ts", "listarDenunciasAction", "admin/denuncias"],
  ["../app/(protected)/admin/auditoria/actions.ts", "buscarAuditorias", "admin/administracoes"],
]) {
  test(`${route}: páginas distintas usam o contrato da API e preservam o limite`, async () => {
    const app = carregar(file);
    const first = await app.exports[action](1, 5), second = await app.exports[action](2, 5);
    assert.notEqual(first.docs[0]._id, second.docs[0]._id);
    assert.equal(second.page, 2);
    assert.deepEqual(app.chamadas.map(c => JSON.parse(JSON.stringify(c.options.params))), [{ page: 1, limit: 5 }, { page: 2, limit: 5 }]);
    assert.ok(app.chamadas.every(c => c.route === route));
  });
  test(`${route}: parâmetros fora dos limites não consultam a API`, async () => {
    const app = carregar(file);
    for (const args of [[0, 5], [-1, 5], [1.5, 5], [1, 1000], [Number.MAX_SAFE_INTEGER + 1, 5]]) {
      await assert.rejects(() => app.exports[action](...args));
    }
    assert.equal(app.chamadas.length, 0);
  });
}
