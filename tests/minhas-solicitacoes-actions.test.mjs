import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const usuarioId = "10000000-0000-0000-0000-000000000001";
const outroUsuarioId = "10000000-0000-0000-0000-000000000002";
const itemId = "20000000-0000-0000-0000-000000000001";
const interesseId = "30000000-0000-0000-0000-000000000001";
const vazio = { sucesso: false, mensagem: "" };

class ErroApi extends Error {}

function form(campos = {}) {
  const dados = new FormData();
  for (const [nome, valor] of Object.entries(campos)) dados.set(nome, valor);
  return dados;
}

function ambiente({
  usuario = usuarioId,
  situacao = "ATIVO",
  interessado = usuarioId,
  interesseStatus = "ACEITO",
  itemStatus = "AGUARDANDO_CONFIRMACAO",
  interesseAceitoId = interesseId,
  falha = null,
  falhaSomentePut = false,
} = {}) {
  const chamadas = [];
  const revalidacoes = [];
  const caminhoFonte = new URL("../app/(protected)/perfil/minhas-solicitacoes/actions.ts", import.meta.url);
  let compilado = "";
  try {
    compilado = ts.transpileModule(readFileSync(caminhoFonte, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
  } catch (erro) {
    if (erro?.code !== "ENOENT") throw erro;
  }
  const contexto = {
    exports: {},
    FormData,
    AbortSignal,
    require(nome) {
      if (nome === "next/cache") return { revalidatePath: (path) => revalidacoes.push(path) };
      if (nome === "next/navigation") return { unstable_rethrow: (erro) => { if (erro?.redirecionar) throw erro; } };
      if (nome === "@/lib/api") return { ErroApi };
      if (nome === "@/lib/auth-server") return {
        getUsuarioLogado: async () => ({ _id: usuario, situacao }),
        fetchApiAutenticado: async (path, opcoes) => {
          chamadas.push({ path, opcoes });
          if (falha && (!falhaSomentePut || opcoes?.metodo === "PUT")) throw falha;
          if (path === `interesses/${interesseId}`) return {
            _id: interesseId,
            status: interesseStatus,
            item_id: { _id: itemId, status: itemStatus },
            usuario_interessado_id: { _id: interessado },
          };
          if (path === `itemdoacao/${itemId}`) return {
            _id: itemId,
            status: itemStatus,
            interesse_aceito_id: interesseAceitoId,
          };
          return {};
        },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  if (compilado) vm.runInNewContext(compilado, contexto);
  const executar = (campos = { interesseId }) => {
    const action = contexto.exports.confirmarRecebimento;
    if (typeof action !== "function") return undefined;
    return action(vazio, form(campos));
  };
  return { executar, chamadas, revalidacoes };
}

test("confirma recebimento apenas para participante aceito com item aguardando, e revalida as telas afetadas", async () => {
  const app = ambiente();
  const resultado = await app.executar();
  assert.equal(resultado.sucesso, true);
  assert.equal(resultado.mensagem, "Recebimento confirmado. A doação foi concluída.");
  assert.deepEqual(app.chamadas.filter((chamada) => chamada.opcoes?.metodo).map((chamada) => [chamada.path, chamada.opcoes.metodo]), [
    [`itemdoacao/${itemId}/confirmar-recebimento`, "PUT"],
  ]);
  assert.deepEqual(app.revalidacoes, ["/perfil/minhas-solicitacoes", "/perfil/meus-anuncios", `/doacoes/${itemId}`]);
});

test("rejeita identificador inválido sem consultar a API", async () => {
  const app = ambiente();
  const resultado = await app.executar({ interesseId: "../admin" });
  assert.equal(resultado.sucesso, false);
  assert.equal(app.chamadas.length, 0);
});

test("exige conta ativa e não confirma interesse pendente ou aceito por outra pessoa", async () => {
  const cases = [
    { situacao: "SUSPENSO" },
    { interesseStatus: "PENDENTE" },
    { interessado: outroUsuarioId },
  ];
  for (const options of cases) {
    const app = ambiente(options);
    assert.equal((await app.executar()).sucesso, false);
    assert.equal(app.chamadas.filter((chamada) => chamada.opcoes?.metodo).length, 0);
  }
});

test("não confirma item em estado diferente nem interesse não selecionado para a doação", async () => {
  for (const options of [{ itemStatus: "RESERVADO" }, { interesseAceitoId: "outro-interesse" }]) {
    const app = ambiente(options);
    assert.equal((await app.executar()).sucesso, false);
    assert.equal(app.chamadas.filter((chamada) => chamada.opcoes?.metodo).length, 0);
  }
});

test("retorna erro de API recuperável e não expõe falha interna", async () => {
  const apiError = new ErroApi("O item não está aguardando confirmação de recebimento.");
  const api = ambiente({ falha: apiError });
  assert.equal((await api.executar()).mensagem, apiError.message);
  assert.deepEqual(api.revalidacoes, []);

  const interno = ambiente({ falha: new Error("segredo interno") });
  const resultado = await interno.executar();
  assert.equal(resultado.sucesso, false);
  assert.equal(resultado.mensagem.includes("segredo interno"), false);
});

test("pede para verificar o estado antes de repetir se o timeout ocorrer na confirmação", async () => {
  const timeout = Object.assign(new Error("timeout interno"), { name: "TimeoutError" });
  const app = ambiente({ falha: timeout, falhaSomentePut: true });
  const resultado = await app.executar();

  assert.equal(resultado.sucesso, false);
  assert.equal(resultado.mensagem, "Não conseguimos confirmar a resposta. Atualize a página para verificar o estado antes de repetir.");
  assert.equal(app.chamadas.filter((chamada) => chamada.opcoes?.metodo === "PUT").length, 1);
  assert.deepEqual(app.revalidacoes, []);
});

test("preserva o redirecionamento de sessão expirada em vez de tratá-lo como erro comum", async () => {
  const redirecionar = { redirecionar: true };
  const app = ambiente({ falha: redirecionar });
  await assert.rejects(() => app.executar(), (erro) => erro === redirecionar);
});

test("mostra sucesso idempotente se o recebimento já foi confirmado por esta solicitação", async () => {
  const app = ambiente({ itemStatus: "DOADO" });
  const resultado = await app.executar();
  assert.equal(resultado.sucesso, true);
  assert.equal(resultado.mensagem, "O recebimento já consta como confirmado.");
  assert.equal(app.chamadas.filter((chamada) => chamada.opcoes?.metodo).length, 0);
  assert.deepEqual(app.revalidacoes, ["/perfil/minhas-solicitacoes", "/perfil/meus-anuncios", `/doacoes/${itemId}`]);
});
