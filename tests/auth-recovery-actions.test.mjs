import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

function ambiente({
  origin = "https://frontend.example.test",
  requestResponse,
  resetResponse,
} = {}) {
  const chamadas = [];
  const authNative = {
    solicitarRedefinicaoDeSenha: async (...args) => {
      chamadas.push({ metodo: "solicitar", args });
      return requestResponse ?? { data: { status: true }, error: null };
    },
    redefinirSenhaNativa: async (...args) => {
      chamadas.push({ metodo: "redefinir", args });
      return resetResponse ?? { data: { status: true }, error: null };
    },
  };
  const contexto = {
    exports: {},
    FormData,
    URL,
    require(nome) {
      if (nome === "next/headers")
        return { headers: async () => ({ get: () => origin }) };
      if (nome === "@/lib/auth-native-client") return authNative;
      if (nome === "@/lib/perfil-validation")
        return require("../lib/perfil-validation.ts");
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  const source = readFileSync(
    new URL("../app/(auth)/recuperacao-actions.ts", import.meta.url),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, contexto);
  return { actions: contexto.exports, chamadas };
}

function formData(values) {
  return { get: (name) => values[name] ?? null };
}

test("solicitação usa o endpoint Better Auth com callback do frontend e mensagem sem alegar envio", async () => {
  const app = ambiente({ origin: "https://preview.example.test" });
  const resultado = await app.actions.solicitarRecuperacao(
    { sucesso: false, mensagem: "" },
    formData({ email: "pessoa@example.test" }),
  );
  assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas[0])), {
    metodo: "solicitar",
    args: [
      "pessoa@example.test",
      "https://preview.example.test/redefinir-senha",
    ],
  });
  assert.equal(resultado.sucesso, true);
  assert.match(resultado.mensagem, /Se o envio estiver habilitado/);
});

test("callback Better Auth deriva apenas a rota de redefinição da origem do frontend", async () => {
  const app = ambiente({ origin: "https://preview.example.test/path" });
  const resultado = await app.actions.solicitarRecuperacao(
    { sucesso: false, mensagem: "" },
    formData({ email: "pessoa@example.test" }),
  );
  assert.equal(resultado.sucesso, true);
  assert.deepEqual(app.chamadas[0].args, [
    "pessoa@example.test",
    "https://preview.example.test/redefinir-senha",
  ]);
});

test("origem ausente impede a chamada externa e e-mail inválido é recusado pela API", async () => {
  const semOrigem = ambiente({ origin: null });
  const falhaOrigem = await semOrigem.actions.solicitarRecuperacao(
    { sucesso: false, mensagem: "" },
    formData({ email: "pessoa@example.test" }),
  );
  assert.equal(falhaOrigem.sucesso, false);
  assert.equal(semOrigem.chamadas.length, 0);

  const emailInvalido = ambiente({
    requestResponse: { data: null, error: { status: 400, message: "Invalid email" } },
  });
  const falhaEmail = await emailInvalido.actions.solicitarRecuperacao(
    { sucesso: false, mensagem: "" },
    formData({ email: "inválido" }),
  );
  assert.equal(falhaEmail.sucesso, false);
  assert.equal(falhaEmail.mensagem, "Informe um e-mail válido.");
  assert.equal(emailInvalido.chamadas.length, 1);
});

test("senha fraca recusada pela API mostra a regra que faltou", async () => {
  const app = ambiente({
    resetResponse: {
      data: null,
      error: {
        status: 400,
        code: "WEAK_PASSWORD",
        message: "A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.",
      },
    },
  });
  const resultado = await app.actions.redefinirSenha(
    { sucesso: false, mensagem: "" },
    formData({ token: "reset-token", novaSenha: "fraca", confirmarSenha: "fraca" }),
  );
  assert.equal(resultado.sucesso, false);
  assert.match(resultado.mensagem, /letra maiúscula/);
  assert.equal(app.chamadas.length, 1);
});

test("outro erro 400 na redefinição continua como link inválido, sem expor a mensagem da API", async () => {
  const app = ambiente({
    resetResponse: { data: null, error: { status: 400, code: "INVALID_TOKEN", message: "Native server message" } },
  });
  const resultado = await app.actions.redefinirSenha(
    { sucesso: false, mensagem: "" },
    formData({ token: "reset-token", novaSenha: "NovaSenha!234", confirmarSenha: "NovaSenha!234" }),
  );
  assert.match(resultado.mensagem, /inválido ou expirou/);
});

test("confirmação diferente e token malformado não chegam à API", async () => {
  for (const campos of [
    { token: "reset-token", novaSenha: "NovaSenha!234", confirmarSenha: "OutraSenha!234" },
    { token: "token com espaço", novaSenha: "NovaSenha!234", confirmarSenha: "NovaSenha!234" },
  ]) {
    const app = ambiente();
    const resultado = await app.actions.redefinirSenha({ sucesso: false, mensagem: "" }, formData(campos));
    assert.equal(resultado.sucesso, false);
    assert.equal(app.chamadas.length, 0);
  }
});

test("redefinição envia token e senha nova ao endpoint Better Auth", async () => {
  const app = ambiente();
  const resultado = await app.actions.redefinirSenha(
    { sucesso: false, mensagem: "" },
    formData({
      token: "reset-token",
      novaSenha: "NovaSenha!234",
      confirmarSenha: "NovaSenha!234",
    }),
  );
  assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas[0])), {
    metodo: "redefinir",
    args: ["NovaSenha!234", "reset-token"],
  });
  assert.equal(resultado.sucesso, true);
});

test("erros de token são genéricos e erros de limite preservam retorno localizado", async () => {
  const tokenExpirado = ambiente({
    resetResponse: { data: null, error: { status: 401 } },
  });
  const erroToken = await tokenExpirado.actions.redefinirSenha(
    { sucesso: false, mensagem: "" },
    formData({
      token: "reset-token",
      novaSenha: "NovaSenha!234",
      confirmarSenha: "NovaSenha!234",
    }),
  );
  assert.match(erroToken.mensagem, /inválido ou expirou/);

  const falhaServidor = ambiente({
    resetResponse: { data: null, error: { status: 503 } },
  });
  const indisponivel = await falhaServidor.actions.redefinirSenha(
    { sucesso: false, mensagem: "" },
    formData({
      token: "reset-token",
      novaSenha: "NovaSenha!234",
      confirmarSenha: "NovaSenha!234",
    }),
  );
  assert.equal(
    indisponivel.mensagem,
    "Não foi possível redefinir a senha. Tente novamente.",
  );

  const limite = ambiente({
    requestResponse: { data: null, error: { status: 429 } },
  });
  const erroLimite = await limite.actions.solicitarRecuperacao(
    { sucesso: false, mensagem: "" },
    formData({ email: "pessoa@example.test" }),
  );
  assert.match(erroLimite.mensagem, /Muitas tentativas/);
});
