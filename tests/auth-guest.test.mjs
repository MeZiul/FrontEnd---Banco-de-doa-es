import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/auth-validation.ts";

const require = createRequire(import.meta.url);
function ambiente({ token, status = 200, transporte } = {}) {
  const chamadas = [], cookiesEscritos = [];
  class ErroApi extends Error { constructor(status) { super("Falha da API"); this.status = status; } }
  const redirecionar = (destino) => { throw Object.assign(new Error("Redirect"), { destino }); };
  const cookieStore = { get: () => token ? { value: token } : undefined, set: (...args) => cookiesEscritos.push(args) };
  const api = { ErroApi, fetchApi: async (path, opcoes) => {
    chamadas.push({ path, opcoes });
    if (transporte) throw transporte;
    if (path === "perfil" && status !== 200) throw new ErroApi(status);
    return path === "auth/login" ? { token: "nova-sessao" } : { _id: "pessoa", perfil: "USUARIO", situacao: "ATIVO" };
  } };
  const cache = new Map();
  function carregar(path) {
    if (cache.has(path)) return cache.get(path);
    const contexto = { exports: {}, AbortSignal, process: { env: { NODE_ENV: "test" } }, require(nome) {
      if (nome === "next/headers") return { cookies: async () => cookieStore };
      if (nome === "next/navigation") return { redirect: redirecionar };
      if (nome === "@/lib/api") return api;
      if (nome === "@/lib/auth-cookie") return { COOKIE_TOKEN: "doai_token" };
      if (nome === "@/lib/auth-validation") return validacao;
      if (nome === "@/lib/auth-guest") return carregar("lib/auth-guest.ts");
      if (nome === "react/jsx-runtime") return require(nome);
      if (nome.startsWith("@/components/auth/")) return { default: () => null, LoginForm: () => null, SignupForm: () => null };
      throw new Error(`Import inesperado: ${nome}`);
    } };
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, contexto);
    cache.set(path, contexto.exports); return contexto.exports;
  }
  return { carregar, chamadas, cookiesEscritos };
}

test("visitante sem cookie não consulta a API nem aciona login automático de desenvolvimento", async () => {
  const app = ambiente();
  await app.carregar("lib/auth-guest.ts").exigirVisitante();
  assert.equal(app.chamadas.length, 0);
});

for (const status of [401, 498]) test(`sessão inválida/expirada (${status}) permite acessar autenticação`, async () => {
  const app = ambiente({ token: "expirada", status });
  await app.carregar("lib/auth-guest.ts").exigirVisitante();
  assert.equal(app.chamadas[0].path, "perfil");
  assert.equal(app.chamadas[0].opcoes.token, "expirada");
  assert.ok(app.chamadas[0].opcoes.signal instanceof AbortSignal);
});

for (const path of ["app/(auth)/login/page.tsx", "app/(auth)/cadastro/page.tsx"]) test(`${path}: sessão validada redireciona antes de renderizar formulário`, async () => {
  const app = ambiente({ token: "sessao-valida" });
  await assert.rejects(() => app.carregar(path).default({ searchParams: Promise.resolve({ redirect: "/login" }) }), erro => erro.destino === "/");
  assert.equal(app.chamadas.length, 1);
});

test("403 e falhas de infraestrutura não são tratadas como expiração", async () => {
  for (const status of [403, 500, 503]) {
    const app = ambiente({ token: "existente", status });
    await assert.rejects(() => app.carregar("lib/auth-guest.ts").exigirVisitante(), erro => erro.status === status);
  }
  const falha = new TypeError("Conexão indisponível");
  await assert.rejects(() => ambiente({ token: "existente", transporte: falha }).carregar("lib/auth-guest.ts").exigirVisitante(), erro => erro === falha);
});

test("actions de aba antiga bloqueiam novo login/cadastro antes de validar e escrever", async () => {
  for (const nome of ["entrar", "cadastrar"]) {
    const app = ambiente({ token: "sessao-valida" });
    await assert.rejects(() => app.carregar("app/(auth)/actions.ts")[nome]({}, "/login"), erro => erro.destino === "/");
    assert.equal(app.chamadas.length, 1);
    assert.equal(app.chamadas[0].path, "perfil");
    assert.equal(app.cookiesEscritos.length, 0);
  }
});

test("cookie revogado permite substituir a sessão pela fachada de domínio", async () => {
  const app = ambiente({ token: "revogada", status: 498 });
  await assert.rejects(() => app.carregar("app/(auth)/actions.ts").entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil"), erro => erro.destino === "/perfil");
  assert.deepEqual(app.chamadas.map(c => c.path), ["perfil", "auth/login"]);
  assert.equal(app.cookiesEscritos[0][0], "doai_token");
  assert.equal(app.cookiesEscritos[0][1], "nova-sessao");
});
