import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/auth-validation.ts";

const require = createRequire(import.meta.url);
function ambiente({ token, status = 200, transporte, nativeResponse, nativeThrow } = {}) {
  const chamadas = [], cookiesEscritos = [], chamadasNativas = [];
  class ErroApi extends Error { constructor(status) { super("Falha da API"); this.status = status; } }
  const redirecionar = (destino) => { throw Object.assign(new Error("Redirect"), { destino }); };
  const cookieStore = { get: () => token ? { value: token } : undefined, set: (...args) => cookiesEscritos.push(args) };
  const authNative = { autenticarComEmail: async (...args) => {
    chamadasNativas.push(args);
    if (nativeThrow) throw nativeThrow;
    return nativeResponse ?? { data: { redirect: false, token: "nova-sessao", user: { id: "pessoa" } }, error: null };
  } };
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
      if (nome === "@/lib/auth-native-client") return authNative;
      if (nome === "react/jsx-runtime") return require(nome);
      if (nome.startsWith("@/components/auth/")) return { default: () => null, LoginForm: () => null, SignupForm: () => null };
      throw new Error(`Import inesperado: ${nome}`);
    } };
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, contexto);
    cache.set(path, contexto.exports); return contexto.exports;
  }
  return { carregar, chamadas, chamadasNativas, cookiesEscritos };
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

test("cookie revogado permite substituir a sessão pelo login Better Auth e preserva o contrato do cookie", async () => {
  const app = ambiente({ token: "revogada", status: 498 });
  await assert.rejects(() => app.carregar("app/(auth)/actions.ts").entrar({ email: "pessoa@example.test", senha: "exemplo", lembrar: true }, "/perfil"), erro => erro.destino === "/perfil");
  assert.deepEqual(app.chamadas.map(c => c.path), ["perfil"]);
  assert.deepEqual(app.chamadasNativas, [["pessoa@example.test", "exemplo", true]]);
  assert.equal(app.cookiesEscritos[0][0], "doai_token");
  assert.equal(app.cookiesEscritos[0][1], "nova-sessao");
  assert.deepEqual(app.cookiesEscritos[0][2], { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 604800 });
});

test("login Better Auth não é chamado quando a entrada é inválida", async () => {
  const app = ambiente();
  const resultado = await app.carregar("app/(auth)/actions.ts").entrar({ email: "", senha: "" }, "/perfil");
  assert.equal(typeof resultado.erro, "string");
  assert.equal(app.chamadasNativas.length, 0);
  assert.equal(app.cookiesEscritos.length, 0);
});

for (const [status, mensagem] of [
  [400, "E-mail ou senha inválidos."],
  [401, "E-mail ou senha inválidos."],
  [403, "Não foi possível entrar nesta conta. Verifique os dados e tente novamente."],
  [429, "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."],
  [500, "Não foi possível realizar o login. Tente novamente."],
]) test(`resposta nativa ${status} retorna mensagem localizada sem gravar sessão`, async () => {
  const app = ambiente({ nativeResponse: { data: null, error: { status, message: "Native server message" } } });
  const resultado = await app.carregar("app/(auth)/actions.ts").entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
  assert.equal(resultado.erro, mensagem);
  assert.equal(app.chamadasNativas.length, 1);
  assert.equal(app.cookiesEscritos.length, 0);
});

test("resposta sem token e erro de transporte não gravam cookie de sessão", async () => {
  const incompleta = ambiente({ nativeResponse: { data: { token: "", user: { id: "pessoa" } }, error: null } });
  const resultadoIncompleto = await incompleta.carregar("app/(auth)/actions.ts").entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
  assert.equal(resultadoIncompleto.erro, "A API não retornou uma sessão válida. Tente novamente.");
  assert.equal(incompleta.cookiesEscritos.length, 0);

  const falha = ambiente({ nativeThrow: new TypeError("Conexão indisponível") });
  const resultadoFalha = await falha.carregar("app/(auth)/actions.ts").entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
  assert.equal(resultadoFalha.erro, "Não foi possível realizar o login. Tente novamente.");
  assert.equal(falha.cookiesEscritos.length, 0);
});
