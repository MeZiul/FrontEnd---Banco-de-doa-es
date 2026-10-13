import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import {
  autenticarComEmail,
  cadastrarComEmail,
  consultarSessaoNativa,
  encerrarSessaoNativa,
  redefinirSenhaNativa,
  solicitarRedefinicaoDeSenha,
} from "../lib/auth-native-client.ts";

async function criarServidorAuth(responder) {
  const requisicoes = [];
  const server = createServer(async (request, response) => {
    const partes = [];
    for await (const parte of request) partes.push(parte);
    const texto = Buffer.concat(partes).toString("utf8");
    requisicoes.push({
      method: request.method,
      path: request.url,
      origin: request.headers.origin,
      authorization: request.headers.authorization,
      cookie: request.headers.cookie,
      body: texto ? JSON.parse(texto) : undefined,
    });
    responder(response, requisicoes.at(-1));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return {
    requisicoes,
    baseURL: `http://127.0.0.1:${address.port}`,
    fechar: () =>
      new Promise((resolve, reject) =>
        server.close((erro) => (erro ? reject(erro) : resolve())),
      ),
  };
}

function configurarApiLocal(baseURL) {
  const anterior = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = baseURL;
  return () => {
    if (anterior === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = anterior;
  };
}

function json(response, body, status = 200) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

test("Better Auth SDK envia login nativo e retorna o token para a ponte HttpOnly", async () => {
  const fixture = await criarServidorAuth((response) =>
    json(response, {
      redirect: false,
      token: "fixture-session-token",
      user: { id: "fixture-user", email: "pessoa@example.test" },
    }),
  );
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await autenticarComEmail(
      "pessoa@example.test",
      "senha-fixture",
      false,
    );
    assert.deepEqual(fixture.requisicoes[0], {
      method: "POST",
      path: "/api/auth/sign-in/email",
      origin: undefined,
      authorization: undefined,
      cookie: undefined,
      body: {
        email: "pessoa@example.test",
        password: "senha-fixture",
        rememberMe: false,
      },
    });
    assert.equal(resposta.error, null);
    assert.equal(resposta.data?.token, "fixture-session-token");
    assert.deepEqual(resposta.data?.user, {
      id: "fixture-user",
      email: "pessoa@example.test",
    });
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("erro de credenciais é preservado sem repetir a requisição", async () => {
  const fixture = await criarServidorAuth((response) =>
    json(
      response,
      {
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
      },
      401,
    ),
  );
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await autenticarComEmail(
      "pessoa@example.test",
      "senha-incorreta",
      true,
    );
    assert.equal(fixture.requisicoes.length, 1);
    assert.equal(fixture.requisicoes[0].path, "/api/auth/sign-in/email");
    assert.equal(fixture.requisicoes[0].body.rememberMe, true);
    assert.equal(resposta.data, null);
    assert.equal(resposta.error?.status, 401);
    assert.equal(resposta.error?.code, "INVALID_EMAIL_OR_PASSWORD");
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("cadastro usa sign-up.email com campos adicionais e sem criar sessão", async () => {
  const fixture = await criarServidorAuth((response) =>
    json(response, {
      token: null,
      user: { id: "fixture-user", email: "pessoa@example.test" },
    }),
  );
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await cadastrarComEmail({
      name: "Pessoa Exemplo",
      email: "pessoa@example.test",
      password: "Senha!234",
      cpf: "12345678901",
      telefone: "65999990000",
      cidade: "Cuiabá",
      uf: "MT",
    });
    assert.equal(fixture.requisicoes[0].path, "/api/auth/sign-up/email");
    assert.deepEqual(fixture.requisicoes[0].body, {
      name: "Pessoa Exemplo",
      email: "pessoa@example.test",
      password: "Senha!234",
      cpf: "12345678901",
      telefone: "65999990000",
      cidade: "Cuiabá",
      uf: "MT",
    });
    assert.equal("autoSignIn" in fixture.requisicoes[0].body, false);
    assert.equal(resposta.error, null);
    assert.equal(resposta.data?.token, null);
    assert.equal(resposta.data?.user.id, "fixture-user");
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("solicitação de senha usa o endpoint nativo e o callback do frontend", async () => {
  const fixture = await criarServidorAuth((response) =>
    json(response, { status: true, message: "accepted" }),
  );
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await solicitarRedefinicaoDeSenha(
      "pessoa@example.test",
      "https://frontend.example.test/redefinir-senha",
    );
    assert.equal(
      fixture.requisicoes[0].path,
      "/api/auth/request-password-reset",
    );
    assert.deepEqual(fixture.requisicoes[0].body, {
      email: "pessoa@example.test",
      redirectTo: "https://frontend.example.test/redefinir-senha",
    });
    assert.equal(resposta.data?.status, true);
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("redefinição envia apenas nova senha e token ao SDK", async () => {
  const fixture = await criarServidorAuth((response) =>
    json(response, { status: true }),
  );
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await redefinirSenhaNativa(
      "NovaSenha!234",
      "reset-token-fixture",
    );
    assert.equal(fixture.requisicoes[0].path, "/api/auth/reset-password");
    assert.deepEqual(fixture.requisicoes[0].body, {
      newPassword: "NovaSenha!234",
      token: "reset-token-fixture",
    });
    assert.equal(resposta.data?.status, true);
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("get-session valida por Bearer e trata resposta null como sessão inexistente", async () => {
  const fixture = await criarServidorAuth((response) => json(response, null));
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await consultarSessaoNativa("token-fixture");
    assert.equal(fixture.requisicoes[0].method, "GET");
    assert.equal(fixture.requisicoes[0].path, "/api/auth/get-session");
    assert.equal(fixture.requisicoes[0].authorization, "Bearer token-fixture");
    assert.equal(fixture.requisicoes[0].cookie, undefined);
    assert.equal(resposta.data, null);
    assert.equal(resposta.error, null);
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("sign-out revoga sessão por Bearer sem depender de cookie cross-site", async () => {
  const fixture = await criarServidorAuth((response) =>
    json(response, { success: true }),
  );
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await encerrarSessaoNativa("token-fixture");
    assert.equal(fixture.requisicoes[0].method, "POST");
    assert.equal(fixture.requisicoes[0].path, "/api/auth/sign-out");
    assert.equal(fixture.requisicoes[0].authorization, "Bearer token-fixture");
    assert.equal(fixture.requisicoes[0].cookie, undefined);
    assert.equal(resposta.error, null);
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});
