import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function ambiente({
  token = "cookie-token",
  sessionResponse = {
    data: { session: { id: "session" }, user: { id: "better-user" } },
    error: null,
  },
  sessionThrow,
  profile = { _id: "domain-user", perfil: "USUARIO", situacao: "ATIVO" },
  apiStatus,
  env = { NODE_ENV: "test" },
} = {}) {
  const chamadasApi = [];
  const chamadasSignIn = [];
  const chamadasSessao = [];
  const redirecionar = (destino) => {
    throw Object.assign(new Error("Redirect"), { destino });
  };
  const cookieStore = { get: () => (token ? { value: token } : undefined) };
  class ErroApi extends Error {
    constructor(status) {
      super("Falha do domínio");
      this.status = status;
    }
  }
  const api = {
    ErroApi,
    fetchApi: async (path, opcoes) => {
      chamadasApi.push({ path, opcoes });
      if (apiStatus) throw new ErroApi(apiStatus);
      return profile;
    },
  };
  const authNative = {
    autenticarComEmail: async (...args) => {
      chamadasSignIn.push(args);
      return {
        data: { token: "dev-native-token", user: { id: "better-user" } },
        error: null,
      };
    },
    consultarSessaoNativa: async (value) => {
      chamadasSessao.push(value);
      if (sessionThrow) throw sessionThrow;
      return sessionResponse;
    },
  };
  const contexto = {
    exports: {},
    AbortSignal,
    process: { env },
    require(nome) {
      if (nome === "next/headers") return { cookies: async () => cookieStore };
      if (nome === "next/navigation") return { redirect: redirecionar };
      if (nome === "@/lib/api") return api;
      if (nome === "@/lib/auth-cookie") {
        return {
          COOKIE_TOKEN: "doai_token",
          loginDevAtivo: () =>
            env.NODE_ENV === "development" &&
            Boolean(env.DEV_LOGIN_EMAIL && env.DEV_LOGIN_SENHA),
        };
      }
      if (nome === "@/lib/auth-native-client") return authNative;
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  const source = readFileSync(
    new URL("../lib/auth-server.ts", import.meta.url),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, contexto);
  return {
    auth: contexto.exports,
    chamadasApi,
    chamadasSignIn,
    chamadasSessao,
  };
}

test("get-session null impede encaminhar token inválido para a API de domínio", async () => {
  const app = ambiente({ sessionResponse: { data: null, error: null } });
  await assert.rejects(
    () => app.auth.fetchApiAutenticado("perfil"),
    (erro) => erro.destino === "/login",
  );
  assert.deepEqual(app.chamadasSessao, ["cookie-token"]);
  assert.equal(app.chamadasApi.length, 0);
});

test("401 ou 498 lançado por get-session também redireciona sem chamada de domínio", async () => {
  for (const status of [401, 498]) {
    const erroSessao = Object.assign(new Error("Sessão expirada"), { status });
    const app = ambiente({ sessionThrow: erroSessao });
    await assert.rejects(
      () => app.auth.fetchApiAutenticado("perfil"),
      (erro) => erro.destino === "/login",
    );
    assert.equal(app.chamadasApi.length, 0);
  }
});

test("token nativo validado consulta perfil e mantém perfil e situação vindos do domínio", async () => {
  const profile = {
    _id: "domain-user",
    perfil: "ADMINISTRADOR",
    situacao: "ATIVO",
  };
  const app = ambiente({
    sessionResponse: {
      data: {
        session: { id: "session" },
        user: { id: "better-user", perfil: "USUARIO" },
      },
      error: null,
    },
    profile,
  });
  const usuario = await app.auth.getUsuarioLogado();
  assert.deepEqual(JSON.parse(JSON.stringify(usuario)), profile);
  assert.equal(app.chamadasSessao[0], "cookie-token");
  assert.equal(app.chamadasApi[0].path, "perfil");
  assert.equal(app.chamadasApi[0].opcoes.token, "cookie-token");
});

test("situação de domínio inativa bloqueia acesso protegido mesmo com Better Auth válido", async () => {
  const app = ambiente({
    profile: { _id: "domain-user", perfil: "USUARIO", situacao: "SUSPENSO" },
  });
  await assert.rejects(
    () => app.auth.getUsuarioLogado(),
    (erro) => erro.destino === "/login",
  );
});

test("expiração da API de domínio continua redirecionando após a sessão Better ser validada", async () => {
  const app = ambiente({ apiStatus: 498 });
  await assert.rejects(
    () => app.auth.fetchApiAutenticado("perfil"),
    (erro) => erro.destino === "/login",
  );
  assert.equal(app.chamadasSessao.length, 1);
  assert.equal(app.chamadasApi[0].path, "perfil");
});

test("fallback de desenvolvimento também autentica pelo SDK Better Auth", async () => {
  const env = {
    NODE_ENV: "development",
    DEV_LOGIN_EMAIL: "fixture@example.test",
    DEV_LOGIN_SENHA: "fixture-only-password",
  };
  const app = ambiente({ token: null, env });
  await app.auth.getUsuarioLogado();
  assert.deepEqual(app.chamadasSignIn, [
    ["fixture@example.test", "fixture-only-password", false],
  ]);
  assert.deepEqual(app.chamadasSessao, ["dev-native-token"]);
  assert.deepEqual(
    app.chamadasApi.map((chamada) => chamada.path),
    ["perfil"],
  );
});
