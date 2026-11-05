import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/auth-validation.ts";

const require = createRequire(import.meta.url);

function ambiente({
  token,
  status = 200,
  transporte,
  profile,
  nativeResponse,
  nativeThrow,
  signupResponse,
  sessionResponse,
  sessionThrow,
  signOutResponse,
} = {}) {
  const chamadas = [];
  const chamadasNativas = [];
  const sessoesNativas = [];
  const cookiesEscritos = [];
  const cookiesExcluidos = [];

  class ErroApi extends Error {
    constructor(statusErro) {
      super("Falha da API");
      this.status = statusErro;
    }
  }

  const redirecionar = (destino) => {
    throw Object.assign(new Error("Redirect"), { destino });
  };
  const cookieStore = {
    get: () => (token ? { value: token } : undefined),
    set: (...args) => cookiesEscritos.push(args),
    delete: (nome) => cookiesExcluidos.push(nome),
  };
  const authNative = {
    autenticarComEmail: async (...args) => {
      chamadasNativas.push({ metodo: "entrar", args });
      if (nativeThrow) throw nativeThrow;
      return (
        nativeResponse ?? {
          data: {
            redirect: false,
            token: "nova-sessao",
            user: { id: "pessoa" },
          },
          error: null,
        }
      );
    },
    cadastrarComEmail: async (dados) => {
      chamadasNativas.push({ metodo: "cadastrar", args: [dados] });
      if (nativeThrow) throw nativeThrow;
      return (
        signupResponse ?? {
          data: { token: null, user: { id: "pessoa" } },
          error: null,
        }
      );
    },
    consultarSessaoNativa: async (valor) => {
      sessoesNativas.push(valor);
      if (sessionThrow) throw sessionThrow;
      return (
        sessionResponse ?? {
          data: { session: { id: "sessao" }, user: { id: "pessoa" } },
          error: null,
        }
      );
    },
    encerrarSessaoNativa: async (valor) => {
      chamadasNativas.push({ metodo: "sair", args: [valor] });
      return signOutResponse ?? { data: { success: true }, error: null };
    },
  };
  const api = {
    ErroApi,
    fetchApi: async (path, opcoes) => {
      chamadas.push({ path, opcoes });
      if (transporte) throw transporte;
      if (path === "perfil" && status !== 200) throw new ErroApi(status);
      return profile ?? { _id: "pessoa", perfil: "USUARIO", situacao: "ATIVO" };
    },
  };

  const cache = new Map();
  function carregar(path) {
    if (cache.has(path)) return cache.get(path);
    const contexto = {
      exports: {},
      AbortSignal,
      process: { env: { NODE_ENV: "test" } },
      require(nome) {
        if (nome === "next/headers")
          return { cookies: async () => cookieStore };
        if (nome === "next/navigation") return { redirect: redirecionar };
        if (nome === "@/lib/api") return api;
        if (nome === "@/lib/auth-cookie") return { COOKIE_TOKEN: "doai_token" };
        if (nome === "@/lib/auth-validation") return validacao;
        if (nome === "@/lib/auth-guest") return carregar("lib/auth-guest.ts");
        if (nome === "@/lib/auth-native-client") return authNative;
        if (nome === "react/jsx-runtime") return require(nome);
        if (nome.startsWith("@/components/auth/")) {
          return {
            default: () => null,
            LoginForm: () => null,
            SignupForm: () => null,
          };
        }
        throw new Error(`Import inesperado: ${nome}`);
      },
    };
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(code, contexto);
    cache.set(path, contexto.exports);
    return contexto.exports;
  }

  return {
    carregar,
    chamadas,
    chamadasNativas,
    sessoesNativas,
    cookiesEscritos,
    cookiesExcluidos,
  };
}

test("visitante sem cookie não consulta Better Auth nem ativa login automático de desenvolvimento", async () => {
  const app = ambiente();
  await app.carregar("lib/auth-guest.ts").exigirVisitante();
  assert.equal(app.sessoesNativas.length, 0);
  assert.equal(app.chamadas.length, 0);
});

test("get-session 200 null permite visitante sem consultar o perfil do domínio", async () => {
  const app = ambiente({
    token: "expirada",
    sessionResponse: { data: null, error: null },
  });
  await app.carregar("lib/auth-guest.ts").exigirVisitante();
  assert.deepEqual(app.sessoesNativas, ["expirada"]);
  assert.equal(app.chamadas.length, 0);
});

for (const status of [401, 498]) {
  test(`get-session ${status} permite trocar uma sessão inválida`, async () => {
    const app = ambiente({
      token: "revogada",
      sessionResponse: { data: null, error: { status } },
    });
    await app.carregar("lib/auth-guest.ts").exigirVisitante();
    assert.equal(app.sessoesNativas[0], "revogada");
    assert.equal(app.chamadas.length, 0);
  });
}

test("sessão válida exige perfil de domínio ativo antes de redirecionar visitante", async () => {
  const app = ambiente({ token: "sessao-valida" });
  await assert.rejects(
    () => app.carregar("lib/auth-guest.ts").exigirVisitante(),
    (erro) => erro.destino === "/",
  );
  assert.deepEqual(app.sessoesNativas, ["sessao-valida"]);
  assert.equal(app.chamadas[0].path, "perfil");
  assert.equal(app.chamadas[0].opcoes.token, "sessao-valida");
  assert.ok(app.chamadas[0].opcoes.signal instanceof AbortSignal);
});

for (const path of [
  "app/(auth)/login/page.tsx",
  "app/(auth)/cadastro/page.tsx",
]) {
  test(`${path}: sessão válida redireciona antes de renderizar o formulário`, async () => {
    const app = ambiente({ token: "sessao-valida" });
    await assert.rejects(
      () =>
        app
          .carregar(path)
          .default({ searchParams: Promise.resolve({ redirect: "/login" }) }),
      (erro) => erro.destino === "/",
    );
    assert.deepEqual(app.sessoesNativas, ["sessao-valida"]);
    assert.equal(app.chamadas[0].path, "perfil");
  });
}

test("perfil inativo e respostas de domínio 403/5xx não são tratados como sessão expirada", async () => {
  const inativo = ambiente({
    token: "sessao-valida",
    profile: { _id: "pessoa", situacao: "SUSPENSO" },
  });
  await assert.rejects(
    () => inativo.carregar("lib/auth-guest.ts").exigirVisitante(),
    /perfil ativo/,
  );

  for (const status of [403, 500, 503]) {
    const app = ambiente({ token: "sessao-valida", status });
    await assert.rejects(
      () => app.carregar("lib/auth-guest.ts").exigirVisitante(),
      (erro) => erro.status === status,
    );
  }
});

test("falhas de verificação Better Auth não abrem o formulário", async () => {
  for (const status of [403, 500, 503]) {
    const app = ambiente({
      token: "existente",
      sessionResponse: { data: null, error: { status } },
    });
    await assert.rejects(() =>
      app.carregar("lib/auth-guest.ts").exigirVisitante(),
    );
    assert.equal(app.chamadas.length, 0);
  }

  const falha = new TypeError("Conexão indisponível");
  await assert.rejects(
    () =>
      ambiente({ token: "existente", sessionThrow: falha })
        .carregar("lib/auth-guest.ts")
        .exigirVisitante(),
    (erro) => erro === falha,
  );
});

test("ações de uma aba antiga bloqueiam login e cadastro quando a sessão está ativa", async () => {
  for (const nome of ["entrar", "cadastrar"]) {
    const app = ambiente({ token: "sessao-valida" });
    await assert.rejects(
      () => app.carregar("app/(auth)/actions.ts")[nome]({}, "/login"),
      (erro) => erro.destino === "/",
    );
    assert.equal(app.sessoesNativas.length, 1);
    assert.equal(app.chamadas[0].path, "perfil");
    assert.equal(app.cookiesEscritos.length, 0);
  }
});

test("cookie revogado permite login Better Auth e mantém a sessão HttpOnly", async () => {
  const app = ambiente({
    token: "revogada",
    sessionResponse: { data: null, error: null },
  });
  await assert.rejects(
    () =>
      app
        .carregar("app/(auth)/actions.ts")
        .entrar(
          { email: "pessoa@example.test", senha: "exemplo", lembrar: true },
          "/perfil",
        ),
    (erro) => erro.destino === "/perfil",
  );
  assert.equal(app.chamadas.length, 0);
  assert.deepEqual(app.chamadasNativas, [
    {
      metodo: "entrar",
      args: ["pessoa@example.test", "exemplo", true],
    },
  ]);
  assert.equal(app.cookiesEscritos[0][0], "doai_token");
  assert.equal(app.cookiesEscritos[0][1], "nova-sessao");
  assert.deepEqual(app.cookiesEscritos[0][2], {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
});

test("cadastro Better Auth usa dados validados, não abre sessão e exige login explícito", async () => {
  const app = ambiente({
    token: "revogada",
    sessionResponse: { data: null, error: null },
  });
  await assert.rejects(
    () =>
      app.carregar("app/(auth)/actions.ts").cadastrar({
        nome: "Maria da Silva",
        email: "maria@example.test",
        cpf: "529.982.247-25",
        telefone: "11999999999",
        cidade: "São Paulo",
        uf: "sp",
        senha: "Teste123!",
        confirmarSenha: "Teste123!",
        termos: true,
        perfil: "ADMINISTRADOR",
      }),
    (erro) => erro.destino === "/login?cadastro=sucesso",
  );
  assert.equal(app.chamadas.length, 0);
  assert.equal(app.cookiesEscritos.length, 0);
  assert.equal(
    JSON.stringify(app.chamadasNativas[0]),
    JSON.stringify({
      metodo: "cadastrar",
      args: [
        {
          name: "Maria da Silva",
          email: "maria@example.test",
          password: "Teste123!",
          cpf: "52998224725",
          telefone: "11999999999",
          cidade: "São Paulo",
          uf: "SP",
        },
      ],
    }),
  );
});

test("login vazio é conferido pela API e não grava sessão", async () => {
  const app = ambiente({
    nativeResponse: { data: null, error: { status: 400, message: "Invalid email" } },
  });
  const resultado = await app
    .carregar("app/(auth)/actions.ts")
    .entrar({ email: "", senha: "" }, "/perfil");
  assert.equal(resultado.erro, "E-mail ou senha inválidos.");
  assert.equal(app.chamadasNativas.length, 1);
  assert.equal(app.cookiesEscritos.length, 0);
});

test("cadastro recusado pelo Zod da API mostra a mensagem do campo", async () => {
  for (const [erro, mensagem] of [
    [{ status: 400, code: "INVALID_CPF", message: "CPF inválido.", issues: [{ field: "cpf", message: "CPF inválido." }] }, "CPF inválido."],
    [{ status: 400, code: "INVALID_SIGN_UP_DATA", message: "Dados de cadastro inválidos.", issues: [{ field: "name", message: "Nome deve ter no mínimo 3 caracteres." }] }, "Nome deve ter no mínimo 3 caracteres."],
    [{ status: 400 }, "Não foi possível criar a conta. Verifique os dados e tente novamente."],
  ]) {
    const app = ambiente({
      sessionResponse: { data: null, error: null },
      signupResponse: { data: null, error: erro },
    });
    const resultado = await app.carregar("app/(auth)/actions.ts").cadastrar({
      nome: "A",
      email: "maria@example.test",
      cpf: "123",
      telefone: "",
      cidade: "São Paulo",
      uf: "SP",
      senha: "Teste123!",
      confirmarSenha: "Teste123!",
      termos: true,
    });
    assert.equal(resultado.erro, mensagem);
    assert.equal(app.chamadasNativas.length, 1);
  }
});

test("cadastro recusado por outro motivo mantém mensagem localizada, sem expor a da API", async () => {
  for (const [status, mensagem] of [
    [409, "Já existe uma conta com estes dados."],
    [429, "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."],
    [500, "Não foi possível criar a conta. Verifique os dados e tente novamente."],
  ]) {
    const app = ambiente({
      signupResponse: { data: null, error: { status, message: "Native server message" } },
    });
    const resultado = await app.carregar("app/(auth)/actions.ts").cadastrar({
      nome: "Maria da Silva",
      email: "maria@example.test",
      cpf: "529.982.247-25",
      telefone: "",
      cidade: "São Paulo",
      uf: "SP",
      senha: "Teste123!",
      confirmarSenha: "Teste123!",
      termos: true,
    });
    assert.equal(resultado.erro, mensagem);
  }
});

for (const [status, mensagem] of [
  [400, "E-mail ou senha inválidos."],
  [401, "E-mail ou senha inválidos."],
  [
    403,
    "Não foi possível entrar nesta conta. Verifique os dados e tente novamente.",
  ],
  [429, "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."],
  [500, "Não foi possível realizar o login. Tente novamente."],
]) {
  test(`resposta nativa ${status} retorna mensagem localizada sem gravar sessão`, async () => {
    const app = ambiente({
      nativeResponse: {
        data: null,
        error: {
          status,
          code: status === 403 ? "ORIGIN_CHECK_FAILED" : undefined,
          message: "Native server message",
        },
      },
    });
    const resultado = await app
      .carregar("app/(auth)/actions.ts")
      .entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
    assert.equal(resultado.erro, mensagem);
    assert.equal(app.chamadasNativas.length, 1);
    assert.equal(app.cookiesEscritos.length, 0);
  });
}

test("403 ACCOUNT_SUSPENDED mostra motivo legível e código/mensagem desconhecidos continuam genéricos", async () => {
  const suspensa = ambiente({
    nativeResponse: {
      data: null,
      error: {
        status: 403,
        code: "ACCOUNT_SUSPENDED",
        message: "Conta suspensa até 13/10/2026 por violação das regras.",
      },
    },
  });
  const resultadoSuspensa = await suspensa
    .carregar("app/(auth)/actions.ts")
    .entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
  assert.equal(
    resultadoSuspensa.erro,
    "Conta suspensa até 13/10/2026 por violação das regras.",
  );
  assert.equal(suspensa.cookiesEscritos.length, 0);

  for (const error of [
    { status: 403, code: "ORIGIN_CHECK_FAILED", message: "Origin rejected" },
    { status: 403, code: "ACCOUNT_SUSPENDED", message: "   " },
  ]) {
    const app = ambiente({ nativeResponse: { data: null, error } });
    const resultado = await app
      .carregar("app/(auth)/actions.ts")
      .entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
    assert.equal(
      resultado.erro,
      "Não foi possível entrar nesta conta. Verifique os dados e tente novamente.",
    );
    assert.equal(app.cookiesEscritos.length, 0);
  }
});

test("resposta sem token e erro de transporte não gravam cookie de sessão", async () => {
  const incompleta = ambiente({
    nativeResponse: {
      data: { token: "", user: { id: "pessoa" } },
      error: null,
    },
  });
  const resultadoIncompleto = await incompleta
    .carregar("app/(auth)/actions.ts")
    .entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
  assert.equal(
    resultadoIncompleto.erro,
    "A API não retornou uma sessão válida. Tente novamente.",
  );
  assert.equal(incompleta.cookiesEscritos.length, 0);

  const falha = ambiente({
    nativeThrow: new TypeError("Conexão indisponível"),
  });
  const resultadoFalha = await falha
    .carregar("app/(auth)/actions.ts")
    .entrar({ email: "pessoa@example.test", senha: "exemplo" }, "/perfil");
  assert.equal(
    resultadoFalha.erro,
    "Não foi possível realizar o login. Tente novamente.",
  );
  assert.equal(falha.cookiesEscritos.length, 0);
});

test("sign-out Better Auth limpa o cookie após revogar ou confirmar sessão já expirada", async () => {
  const app = ambiente({ token: "sessao-valida" });
  await assert.rejects(
    () => app.carregar("app/(auth)/actions.ts").sair(),
    (erro) => erro.destino === "/login",
  );
  assert.deepEqual(app.chamadasNativas, [
    { metodo: "sair", args: ["sessao-valida"] },
  ]);
  assert.deepEqual(app.cookiesExcluidos, ["doai_token"]);
});

test("falha de sign-out mantém cookie para permitir nova tentativa", async () => {
  const app = ambiente({
    token: "sessao-valida",
    signOutResponse: { data: null, error: { status: 503 } },
  });
  const resultado = await app.carregar("app/(auth)/actions.ts").sair();
  assert.equal(
    resultado.erro,
    "Não foi possível encerrar a sessão. Tente novamente.",
  );
  assert.deepEqual(app.cookiesExcluidos, []);
});
