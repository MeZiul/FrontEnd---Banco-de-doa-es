import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Executa as ações reais com a API isolada, sem carregar credenciais ou acessar banco.
const fonte = readFileSync(new URL("../app/(protected)/perfil/meus-anuncios/actions.ts", import.meta.url), "utf8");
const compilado = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const usuarioId = "10000000-0000-0000-0000-000000000001";
const itemId = "20000000-0000-0000-0000-000000000001";
const interesseId = "30000000-0000-0000-0000-000000000001";

function ambiente({ status = "DISPONIVEL", dono = usuarioId, interesses = [], falha = null } = {}) {
  const chamadas = [];
  const revalidacoes = [];
  class ErroApi extends Error {}
  const contexto = {
    exports: {},
    require(nome) {
      if (nome === "next/cache") return { revalidatePath: (path) => revalidacoes.push(path) };
      if (nome === "next/navigation") return { unstable_rethrow: (erro) => { if (erro?.redirecionar) throw erro; } };
      if (nome === "@/lib/api") return { ErroApi };
      if (nome === "@/lib/auth-server") return {
        getUsuarioLogado: async () => ({ _id: usuarioId, situacao: "ATIVO" }),
        fetchApiAutenticado: async (path, opcoes) => {
          chamadas.push({ path, opcoes });
          if (falha) throw falha;
          if (path === `usuario/${usuarioId}/itens`) return [{ _id: itemId, usuario_id: dono, status }];
          if (path === `itens/${itemId}/interesses`) return interesses;
          return {};
        },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  vm.runInNewContext(compilado, contexto);
  const executar = (acao, campos = {}) => {
    const dados = new FormData();
    for (const [nome, valor] of Object.entries({ id: itemId, acao, ...campos })) dados.set(nome, valor);
    return contexto.exports.alterarAnuncio({ sucesso: false, mensagem: "" }, dados);
  };
  return { executar, carregar: contexto.exports.carregarInteressados, chamadas, revalidacoes };
}

test("não altera um item que a API não identifica como pertencente à sessão", async () => {
  const app = ambiente({ dono: "outro-usuario" });
  assert.equal((await app.executar("cancelar", { motivo: "Motivo de cancelamento" })).sucesso, false);
  assert.equal(app.chamadas.filter(({ opcoes }) => opcoes?.metodo).length, 0);
});

test("rejeita identificadores inválidos antes de consultar a API", async () => {
  const app = ambiente();
  assert.equal((await app.executar("cancelar", { id: "../admin", motivo: "Motivo de cancelamento" })).sucesso, false);
  assert.equal(app.chamadas.length, 0);
});

test("cancelamento valida motivo e bloqueia estados terminais", async () => {
  for (const status of ["DOADO", "CANCELADO"]) {
    const app = ambiente({ status });
    assert.equal((await app.executar("cancelar", { motivo: "Motivo de cancelamento" })).sucesso, false);
    assert.equal(app.chamadas.filter(({ opcoes }) => opcoes?.metodo).length, 0);
  }
  const app = ambiente();
  assert.equal((await app.executar("cancelar", { motivo: "curto" })).sucesso, false);
  assert.equal(app.chamadas.filter(({ opcoes }) => opcoes?.metodo).length, 0);
});

test("cancelamento válido usa PATCH com motivo e revalida a página", async () => {
  const app = ambiente({ status: "RESERVADO" });
  assert.equal((await app.executar("cancelar", { motivo: "  Item ficou indisponível  " })).sucesso, true);
  const chamada = app.chamadas.at(-1);
  assert.equal(chamada.path, `itens/${itemId}/cancelar`);
  assert.equal(chamada.opcoes.metodo, "PATCH");
  assert.equal(chamada.opcoes.body.motivo, "Item ficou indisponível");
  assert.deepEqual(app.revalidacoes, ["/perfil/meus-anuncios"]);
});

test("edição valida conteúdo, normaliza UF e não repassa campos de controle", async () => {
  const campos = { titulo: "Mesa de estudos", descricao: "Mesa de madeira em bom estado", condicao_item: "USADO_BOM", cidade: "Cuiabá", uf: "mt", bairro: "", condicoes_doacao: "", status: "DOADO", usuario_id: "outro" };
  const invalido = ambiente();
  assert.equal((await invalido.executar("editar", { ...campos, titulo: "x" })).sucesso, false);
  assert.equal(invalido.chamadas.filter(({ opcoes }) => opcoes?.metodo).length, 0);
  const reservado = ambiente({ status: "RESERVADO" });
  assert.equal((await reservado.executar("editar", campos)).sucesso, false);
  const valido = ambiente();
  assert.equal((await valido.executar("editar", campos)).sucesso, true);
  const chamada = valido.chamadas.at(-1);
  assert.equal(chamada.path, `itemdoacao/${itemId}`);
  assert.equal(chamada.opcoes.metodo, "PUT");
  assert.equal(chamada.opcoes.body.uf, "MT");
  assert.equal(chamada.opcoes.body.status, undefined);
  assert.equal(chamada.opcoes.body.usuario_id, undefined);
});

test("entrega exige reserva e não permite recebimento na ação do doador", async () => {
  const invalido = ambiente();
  assert.equal((await invalido.executar("entregar")).sucesso, false);
  assert.equal((await invalido.executar("receber")).sucesso, false);
  assert.equal(invalido.chamadas.filter(({ opcoes }) => opcoes?.metodo).length, 0);
  const valido = ambiente({ status: "RESERVADO" });
  assert.equal((await valido.executar("entregar")).sucesso, true);
  assert.equal(valido.chamadas.at(-1).path, `itemdoacao/${itemId}/confirmar-entrega`);
});

test("aceite rejeita interesse de outro item ou já respondido", async () => {
  for (const interesse of [{ _id: interesseId, item_id: "outro-item", status: "PENDENTE" }, { _id: interesseId, item_id: itemId, status: "ACEITO" }]) {
    const app = ambiente({ interesses: [interesse] });
    assert.equal((await app.executar("aceitar", { interesseId })).sucesso, false);
    assert.equal(app.chamadas.filter(({ opcoes }) => opcoes?.metodo).length, 0);
  }
  const valido = ambiente({ interesses: [{ _id: interesseId, item_id: itemId, status: "PENDENTE" }] });
  assert.equal((await valido.executar("aceitar", { interesseId })).sucesso, true);
  assert.equal(valido.chamadas.at(-1).path, `interesses/${interesseId}/aceitar`);
});

test("não devolve dados de contato desnecessários na consulta de interessados", async () => {
  const app = ambiente({ interesses: [{ _id: interesseId, item_id: itemId, status: "PENDENTE", usuario_interessado_id: { _id: usuarioId, nome: "Pessoa", cidade: "Cidade", uf: "MT", email: "privado@example.test" }, usuario_doador_id: { email: "outro@example.test" } }] });
  const resultado = await app.carregar(itemId);
  assert.equal(resultado.interesses[0].usuario_interessado_id.email, undefined);
  assert.equal(resultado.interesses[0].usuario_doador_id, undefined);
});

test("preserva redirecionamento de autenticação e oculta erros internos", async () => {
  const redirecionar = { redirecionar: true };
  const app = ambiente({ falha: redirecionar });
  await assert.rejects(app.executar("entregar"), (erro) => erro === redirecionar);
  const interno = ambiente({ falha: new Error("detalhe interno sigiloso") });
  const resultado = await interno.executar("cancelar", { motivo: "Motivo válido de cancelamento" });
  assert.equal(resultado.sucesso, false);
  assert.equal(resultado.mensagem.includes("sigiloso"), false);
});
