import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/perfil-validation.ts";

function ambiente(arquivo, falha, configuracao = {}) {
  const chamadas = [],
    chamadasNativas = [],
    revalidacoes = [],
    cookiesRemovidos = [],
    chamadasGetToken = [],
    chamadasValidacaoSessao = [];

  const {
    token = "token-usuario-autenticado",
    sessaoValida = true,
    cookiesExistentes = ["doai_token"]
  } = configuracao;

  class ErroApi extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }
  const request = async (path, opcoes) => {
    chamadas.push({ path, opcoes });

    if (falha) {
      throw typeof falha === "function" ? falha(ErroApi) : falha;
    }

    return {};
  };
  const contexto = {
    exports: {},
    AbortSignal,
    URL,
    require(nome) {
      if (nome === "next/cache")
        return { revalidatePath: (...args) => revalidacoes.push(args) };
      if (nome === "next/headers")
        return {
          headers: async () => ({ get: () => "https://frontend.example.test" }),

          cookies: async () => ({
            delete: (name) => cookiesRemovidos.push(name),
            getAll: () => cookiesExistentes.map((name) => ({ name, value: "valor-simulado" })),
          })
        };

      if (nome === "next/navigation")
        return {
          unstable_rethrow: (erro) => {
            if (erro?.redirecionar) throw erro;
          },

          redirect: (destino) => { throw { redirecionar: true, destino } }
        };

      if (nome === "@/lib/api") return { ErroApi, fetchApi: request };

      if (nome === "@/lib/auth-cookie") return { COOKIE_TOKEN: "doai_token" };

      if (nome === "@/lib/auth-server") return {
        fetchApiAutenticado: request,
        getToken: async (opcoes) => {
          chamadasGetToken.push(opcoes);
          return token;
        },

        validarSessaoNativa: async (tokenRecebido) => {
          chamadasValidacaoSessao.push(tokenRecebido);
          return sessaoValida;
        }
      };

      if (nome === "@/lib/auth-native-client")
        return {
          solicitarRedefinicaoDeSenha: async (...args) => {
            chamadasNativas.push({ metodo: "solicitar", args });

            return { data: { status: true }, error: null };
          },
          redefinirSenhaNativa: async (...args) => {
            chamadasNativas.push({ metodo: "redefinir", args });

            if (falha) throw falha;

            return { data: { status: true }, error: null };
          }
        };

      if (nome === "@/lib/perfil-validation") return validacao;

      throw new Error(`Import inesperado: ${nome}`);
    },
  };

  const fonte = readFileSync(new URL(arquivo, import.meta.url), "utf8");

  vm.runInNewContext(
    ts.transpileModule(fonte, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    contexto,
  );

  return {
    executar: async (acao, campos = {}) => {
      const form = new FormData();

      for (const [nome, valor] of Object.entries(campos)) {
        form.set(nome, valor);
      }

      return contexto.exports[acao]({ sucesso: false, mensagem: "" }, form);
    },
    chamadas,
    chamadasNativas,
    revalidacoes,
    cookiesRemovidos,
    chamadasGetToken,
    chamadasValidacaoSessao
  };
}

const perfil = {
  nome: "Maria Silva",
  email: "maria@example.test",
  telefone: "",
  cidade: "Vilhena",
  uf: "RO",
  bio: "",
};
test("ação de perfil usa identidade da sessão, ignora alvo injetado e limita o request", async () => {
  const app = ambiente("../app/(protected)/perfil/editar/actions.ts");
  assert.equal(
    (
      await app.executar("salvarPerfil", {
        ...perfil,
        id: "outro",
        perfil: "ADMINISTRADOR",
        cpf: "123",
      })
    ).sucesso,
    true,
  );
  assert.equal(app.chamadas[0].path, "perfil");
  assert.equal(app.chamadas[0].opcoes.metodo, "PUT");
  assert.deepEqual(app.chamadas[0].opcoes.body, perfil);
  assert.ok(app.chamadas[0].opcoes.signal instanceof AbortSignal);
  assert.ok(app.revalidacoes.some(([path]) => path === "/perfil"));
});
test("perfil recusado pelo Zod da API mostra a mensagem do campo", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    (ErroApi) => new ErroApi("UF deve ter 2 caracteres.", 400),
  );
  const resultado = await app.executar("salvarPerfil", { ...perfil, uf: "R" });
  assert.equal(resultado.sucesso, false);
  assert.equal(resultado.mensagem, "UF deve ter 2 caracteres.");
  assert.equal(app.chamadas.length, 1);
});
test("falha interna da API ao salvar o perfil não expõe a mensagem dela", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    (ErroApi) => new ErroApi("private database details", 500),
  );
  const resultado = await app.executar("salvarPerfil", perfil);
  assert.equal(resultado.sucesso, false);
  assert.equal(resultado.mensagem, "Não foi possível salvar o perfil. Tente novamente.");
});
test("sessão expirada preserva redirect do Next", async () => {
  const redirect = { redirecionar: true };
  await assert.rejects(
    ambiente("../app/(protected)/perfil/editar/actions.ts", redirect).executar(
      "salvarPerfil",
      perfil,
    ),
    (erro) => erro === redirect,
  );
});
test("recuperação retorna resposta genérica sem expor cadastro ou dados internos", async () => {
  const app = ambiente("../app/(auth)/recuperacao-actions.ts");
  const resultado = await app.executar("solicitarRecuperacao", {
    email: "maria@example.test",
    redirectTo: "https://evil.test",
  });
  assert.equal(resultado.sucesso, true);
  assert.match(resultado.mensagem, /Se houver uma conta/);
  assert.deepEqual(app.chamadasNativas[0], {
    metodo: "solicitar",
    args: [
      "maria@example.test",
      "https://frontend.example.test/redefinir-senha",
    ],
  });
  const falhou = await ambiente(
    "../app/(auth)/recuperacao-actions.ts",
    new Error("private SMTP details"),
  ).executar("solicitarRecuperacao", { email: "maria@example.test" });
  assert.doesNotMatch(falhou.mensagem, /private|SMTP/);
});
test("reset exige confirmação antes do request e só envia contrato da fachada", async () => {
  const app = ambiente("../app/(auth)/recuperacao-actions.ts");
  const dados = {
    token: "qa-token",
    novaSenha: "NovaSenha123!",
    confirmarSenha: "OutraSenha123!",
  };
  assert.equal((await app.executar("redefinirSenha", dados)).sucesso, false);
  assert.equal(app.chamadasNativas.length, 0);
  assert.equal(
    (
      await app.executar("redefinirSenha", {
        ...dados,
        confirmarSenha: dados.novaSenha,
        userId: "outro",
      })
    ).sucesso,
    true,
  );
  assert.deepEqual(app.chamadasNativas[0], {
    metodo: "redefinir",
    args: ["NovaSenha123!", "qa-token"],
  });
});

test("desativação encerra a sessão tradicional e redireciona para login", async () => {
  const app = ambiente("../app/(protected)/perfil/editar/actions.ts");

  await assert.rejects(app.executar("desativarConta"), (erro) =>
    erro.redirecionar === true &&
    erro.destino === "/login"
  );

  assert.equal(app.chamadas.length, 1);
  assert.equal(app.chamadas[0].path, "perfil");
  assert.equal(app.chamadas[0].opcoes.metodo, "DELETE");

  assert.equal(app.chamadas[0].opcoes.token, "token-usuario-autenticado");

  assert.equal(app.chamadas[0].opcoes.body, undefined);

  assert.ok(app.chamadas[0].opcoes.signal instanceof AbortSignal);

  assert.deepEqual(app.cookiesRemovidos, ["doai_token"]);

  assert.ok(app.revalidacoes.some(([path, tipo]) => path === "/" && tipo === "layout"),
  );
});
test("desativação remove cookies tradicionais e OAuth sem afetar outros cookies", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    undefined,
    {
      token: "token-oauth",
      cookiesExistentes: [
        "better-auth.session_token",
        "better-auth.session_data",
        "__Secure-better-auth.session_token",
        "__Secure-better-auth.session_data",
        "preferencia-tema",
      ],
    },
  );

  await assert.rejects(
    app.executar("desativarConta"),
    (erro) => erro.destino === "/login",
  );

  assert.equal(
    app.chamadas[0].opcoes.token,
    "token-oauth",
  );

  assert.deepEqual(
    [...app.cookiesRemovidos].sort(),
    [
      "doai_token",
      "better-auth.session_token",
      "better-auth.session_data",
      "__Secure-better-auth.session_token",
      "__Secure-better-auth.session_data",
    ].sort(),
  );

  assert.ok(
    !app.cookiesRemovidos.includes("preferencia-tema"),
  );
});
test("desativação não permite utilizar login automático de desenvolvimento", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
  );

  await assert.rejects(
    app.executar("desativarConta"),
    (erro) => erro.destino === "/login",
  );

  assert.equal(app.chamadasGetToken.length, 1);

  assert.equal(
    app.chamadasGetToken[0].permitirLoginDev,
    false,
  );
});
test("desativação sem token redireciona sem realizar requisição", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    undefined,
    {
      token: null,
    },
  );

  await assert.rejects(
    app.executar("desativarConta"),
    (erro) => erro.destino === "/login",
  );

  assert.equal(app.chamadas.length, 0);
  assert.equal(app.chamadasValidacaoSessao.length, 0);
  assert.equal(app.cookiesRemovidos.length, 0);
});
test("desativação com sessão inválida não realiza requisição", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    undefined,
    {
      sessaoValida: false,
    },
  );

  await assert.rejects(
    app.executar("desativarConta"),
    (erro) => erro.destino === "/login",
  );

  assert.equal(app.chamadas.length, 0);

  assert.deepEqual(
    app.chamadasValidacaoSessao,
    ["token-usuario-autenticado"],
  );

  assert.equal(app.cookiesRemovidos.length, 0);
});
test("desativação recusada pela API preserva a mensagem operacional", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    (ErroApi) =>
      new ErroApi(
        "Não foi possível desativar esta conta.",
        400,
      ),
  );

  const resultado = await app.executar("desativarConta");

  assert.equal(resultado.sucesso, false);

  assert.equal(
    resultado.mensagem,
    "Não foi possível desativar esta conta.",
  );

  assert.equal(app.cookiesRemovidos.length, 0);
  assert.equal(app.revalidacoes.length, 0);
});
test("desativação não expõe detalhes internos do backend", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    (ErroApi) =>
      new ErroApi("private database details", 500),
  );

  const resultado = await app.executar("desativarConta");

  assert.equal(resultado.sucesso, false);

  assert.equal(
    resultado.mensagem,
    "Não foi possível desativar a conta. Tente novamente.",
  );

  assert.equal(app.cookiesRemovidos.length, 0);
  assert.equal(app.revalidacoes.length, 0);
});
test("desativação redireciona quando a API informa sessão expirada", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
    (ErroApi) =>
      new ErroApi("Sessão expirada.", 498),
  );

  await assert.rejects(
    app.executar("desativarConta"),
    (erro) => erro.destino === "/login",
  );

  assert.equal(app.chamadas.length, 1);
  assert.equal(app.cookiesRemovidos.length, 0);
});
test("desativação utiliza exclusivamente a identidade da sessão", async () => {
  const app = ambiente(
    "../app/(protected)/perfil/editar/actions.ts",
  );

  await assert.rejects(
    app.executar("desativarConta", {
      id: "outro-usuario",
      usuarioId: "usuario-alvo",
      perfil: "ADMINISTRADOR",
    }),
    (erro) => erro.destino === "/login",
  );

  assert.equal(app.chamadas[0].path, "perfil");
  assert.equal(app.chamadas[0].opcoes.body, undefined);

  assert.equal(
    app.chamadas[0].opcoes.token,
    "token-usuario-autenticado",
  );
});
