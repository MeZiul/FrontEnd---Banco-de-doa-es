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
    constructor(statusErro, mensagem = "Falha da API") {
      super(mensagem);
      this.status = statusErro;
    }
  }
  const redirecionar = (destino) => {
    throw Object.assign(new Error(`Redirect: ${destino}`), { destino });
  };
  const cookiesArmazenados = new Map(token ? [["doai_token", token]] : []);

  const cookieStore = {
    get: (nome) => {
      const value = cookiesArmazenados.get(nome);

      return value !== undefined ? { name: nome, value } : undefined;
    },

    getAll: (nome) => {
      return Array.from(cookiesArmazenados, ([name, value]) => ({ name, value })).filter((cookie) => {
        return nome === undefined || cookie.name === nome;
      });
    },

    set: (...args) => {
      const [nome, valor] = args;

      cookiesEscritos.push(args);
      cookiesArmazenados.set(nome, valor);
    },

    delete: (nome) => {
      cookiesExcluidos.push(nome);
      cookiesArmazenados.delete(nome);
    }
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

      // Cadastro tradicional pelo endpoint de domínio
      if (path === "usuario" && opcoes?.metodo === "POST") {
        if (signupResponse?.error) {
          const erro = signupResponse.error;

          throw new ErroApi(
            erro.status,
            erro.message ?? "Falha da API",
          );
        }

        return { _id: "pessoa" };
      }

      // Simula erros na consulta do perfil
      if (path === "perfil" && status !== 200) {
        throw new ErroApi(status);
      }

      // Perfil padrão com cadastro completo
      return profile ?? {
        _id: "pessoa",
        nome: "Maria da Silva",
        email: "pessoa@example.test",
        cpf: "52998224725",
        telefone: "11999999999",
        cidade: "São Paulo",
        uf: "SP",
        perfil: "USUARIO",
        situacao: "ATIVO",
        cadastro_completo: true
      };
    }
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
        if (nome === "@/lib/auth-server") return carregar("lib/auth-server.ts");
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
  // O login agora consulta o perfil antes de persistir a sessão
  assert.equal(app.chamadas.length, 1);

  assert.equal(app.chamadas[0].path, "perfil");

  assert.equal(app.chamadas[0].opcoes.token, "nova-sessao");

  assert.ok(app.chamadas[0].opcoes.signal instanceof AbortSignal);

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

test("cadastro tradicional usa dados validados, não abre sessão e exige login explícito", async () => {
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

  // Cadastro realizado pelo endpoint de domínio
  assert.equal(app.chamadas.length, 1);

  const chamada = app.chamadas[0];

  assert.equal(chamada.path, "usuario");
  assert.equal(chamada.opcoes.metodo, "POST");

  const dados = chamada.opcoes.body;

  // Valida os dados enviados
  assert.equal(dados.email, "maria@example.test");
  assert.equal(dados.cpf, "52998224725");
  assert.equal(dados.telefone, "11999999999");
  assert.equal(dados.cidade, "São Paulo");
  assert.equal(dados.uf, "SP");

  // Não permite atribuição indevida de privilégios
  assert.notEqual(dados.perfil, "ADMINISTRADOR");

  // Cadastro não deve criar uma sessão automaticamente
  assert.equal(app.cookiesEscritos.length, 0);

  // Não utiliza o cadastro nativo do Better Auth
  assert.equal(app.chamadasNativas.length, 0);

  assert.ok(chamada.opcoes.signal instanceof AbortSignal);
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
    [
      {
        status: 400,
        message: "CPF inválido."
      },
      "CPF inválido."
    ],
    [
      {
        status: 400,
        message: "Nome deve ter no mínimo 3 caracteres."
      },
      "Nome deve ter no mínimo 3 caracteres."
    ],
    [
      {
        status: 400,
        message: "Dados de cadastro inválidos."
      },
      "Dados de cadastro inválidos."
    ]
  ]) {
    const app = ambiente({
      sessionResponse: { data: null, error: null },
      signupResponse: { data: null, error: erro },
    });

    const resultado = await app
      .carregar("app/(auth)/actions.ts")
      .cadastrar({
        nome: "A",
        email: "maria@example.test",
        cpf: "123",
        telefone: "",
        cidade: "São Paulo",
        uf: "SP",
        senha: "Teste123!",
        confirmarSenha: "Teste123!",
        termos: true
      });

    assert.equal(resultado.erro, mensagem);

    // Confirma a utilização do endpoint de cadastro
    assert.equal(app.chamadas.length, 1);
    assert.equal(app.chamadas[0].path, "usuario");
    assert.equal(app.chamadas[0].opcoes.metodo, "POST");

    // Não utiliza o cadastro nativo do Better Auth
    assert.equal(app.chamadasNativas.length, 0);

    // Cadastro recusado não cria sessão
    assert.equal(app.cookiesEscritos.length, 0);
  }
});

test("cadastro apresenta erros de domínio e oculta mensagens de falhas internas", async () => {
  for (const [status, mensagemApi, mensagemEsperada] of [
    [
      409,
      "Já existe uma conta com estes dados.",
      "Já existe uma conta com estes dados."
    ],
    [
      429,
      "Muitas tentativas. Aguarde alguns minutos.",
      "Muitas tentativas. Aguarde alguns minutos."
    ],
    [
      500,
      "Internal server error",
      "Não foi possível criar a conta. Tente novamente."
    ],
    [
      503,
      "Database connection unavailable",
      "Não foi possível criar a conta. Tente novamente."
    ],
  ]) {
    const app = ambiente({
      signupResponse: {
        data: null,
        error: {
          status,
          message: mensagemApi
        }
      }
    });

    const resultado = await app
      .carregar("app/(auth)/actions.ts")
      .cadastrar({
        nome: "Maria da Silva",
        email: "maria@example.test",
        cpf: "529.982.247-25",
        telefone: "",
        cidade: "São Paulo",
        uf: "SP",
        senha: "Teste123!",
        confirmarSenha: "Teste123!",
        termos: true
      });

    assert.equal(resultado.erro, mensagemEsperada);

    assert.equal(app.chamadas.length, 1);
    assert.equal(app.chamadas[0].path, "usuario");
    assert.equal(app.chamadas[0].opcoes.metodo, "POST");

    assert.equal(app.chamadasNativas.length, 0);
    assert.equal(app.cookiesEscritos.length, 0);
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
