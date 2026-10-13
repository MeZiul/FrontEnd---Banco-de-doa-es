import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { autenticarComEmail } from "../lib/auth-native-client.ts";

async function criarServidorAuth(responder) {
  const requisicoes = [];
  const server = createServer(async (request, response) => {
    const partes = [];
    for await (const parte of request) partes.push(parte);
    requisicoes.push({
      method: request.method,
      path: request.url,
      origin: request.headers.origin,
      body: JSON.parse(Buffer.concat(partes).toString("utf8")),
    });
    responder(response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return {
    requisicoes,
    baseURL: `http://127.0.0.1:${address.port}`,
    fechar: () => new Promise((resolve, reject) => server.close(erro => erro ? reject(erro) : resolve())),
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

test("Better Auth client envia sign-in nativo por HTTP e retorna token e usuário de nível superior", async () => {
  const fixture = await criarServidorAuth(response => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({
      redirect: false,
      token: "fixture-session-token",
      user: { id: "fixture-user", email: "pessoa@example.test" },
    }));
  });
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await autenticarComEmail("pessoa@example.test", "senha-fixture", false);
    assert.equal(fixture.requisicoes.length, 1);
    assert.equal(fixture.requisicoes[0].method, "POST");
    assert.equal(fixture.requisicoes[0].path, "/api/auth/sign-in/email");
    assert.deepEqual(fixture.requisicoes[0].body, {
      email: "pessoa@example.test",
      password: "senha-fixture",
      rememberMe: false,
    });
    assert.equal(fixture.requisicoes[0].origin, undefined);
    assert.equal(resposta.error, null);
    assert.equal(resposta.data?.token, "fixture-session-token");
    assert.deepEqual(resposta.data?.user, { id: "fixture-user", email: "pessoa@example.test" });
  } finally {
    restaurarApi();
    await fixture.fechar();
  }
});

test("erro nativo de credenciais é preservado e não repete a requisição", async () => {
  const fixture = await criarServidorAuth(response => {
    response.writeHead(401, { "content-type": "application/json" });
    response.end(JSON.stringify({ code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" }));
  });
  const restaurarApi = configurarApiLocal(fixture.baseURL);
  try {
    const resposta = await autenticarComEmail("pessoa@example.test", "senha-incorreta", true);
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
