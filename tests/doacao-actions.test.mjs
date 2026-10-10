import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const usuarioId = "10000000-0000-0000-0000-000000000001";
const itemId = "20000000-0000-0000-0000-000000000001";
const categoriaId = "30000000-0000-0000-0000-000000000001";
const interessadoId = "40000000-0000-0000-0000-000000000001";
const interesseId = "50000000-0000-0000-0000-000000000001";
const vazio = { sucesso: false, mensagem: "" };
function form(campos) { const dados = new FormData(); for (const [nome, valor] of Object.entries(campos)) dados.set(nome, valor); return dados; }

function ambiente({ usuario = usuarioId, status = "DOADO", erro = null } = {}) {
  const chamadas = [];
  class ErroApi extends Error {}
  const cache = new Map();
  function carregar(path) {
    if (cache.has(path)) return cache.get(path);
    const fonte = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const compilado = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const contexto = { exports: {}, FormData, File, AbortSignal, process: { env: {} }, require(nome) {
      if (nome === "next/cache") return { revalidatePath() {} };
      if (nome === "next/navigation") return { unstable_rethrow(e) { if (e?.redirect) throw e; } };
      if (nome === "@/lib/api") return { ErroApi };
      if (nome === "@/lib/feed") return { UFS: ["MT", "RO", "SP"] };
      if (nome === "@/types/feed") return { CONDICOES: { NOVO: "Novo", USADO_BOM: "Bom" } };
      if (nome === "@/lib/doacao-validation") return carregar("lib/doacao-validation.ts");
      if (nome === "@/lib/auth-server") return {
        getUsuarioLogado: async () => ({ _id: usuario }),
        fetchApiAutenticado: async (path, opcoes) => {
          chamadas.push({ path, opcoes });
          if (erro) throw erro;
          if (path === "perfil") return { _id: usuario };
          if (path === `itemdoacao/${itemId}`) return { usuario_id: { _id: usuarioId }, status, interesse_aceito_id: interesseId };
          if (path === `interesses/${interesseId}`) return { usuario_interessado_id: { _id: interessadoId } };
          return { _id: itemId };
        },
      };
      throw new Error(`Import inesperado ${nome}`);
    } };
    vm.runInNewContext(compilado, contexto);
    cache.set(path, contexto.exports); return contexto.exports;
  }
  return { criar: carregar("app/(protected)/doacoes/nova/actions.ts").criarDoacao, ...carregar("app/doacoes/[id]/actions.ts"), validar: carregar("lib/doacao-validation.ts"), chamadas };
}
const campos = { titulo: "Mesa de estudos", descricao: "Uma mesa em bom estado para estudar.", categoria_id: categoriaId, condicao_item: "USADO_BOM", cidade: "Cuiabá", uf: "mt", bairro: "", condicoes_doacao: "" };

test("criação não repassa autoria, estado, fotos ou campos administrativos", async () => {
  const app = ambiente();
  const resultado = await app.criar(form({ ...campos, usuario_id: "outro", status: "DOADO", perfil: "ADMINISTRADOR", fotos: "arquivo" }));
  assert.equal(resultado.sucesso, true);
  const chamada = app.chamadas.at(-1);
  assert.equal(chamada.path, "itemdoacao");
  assert.equal(chamada.opcoes.body.uf, "MT");
  for (const campo of ["usuario_id", "status", "perfil", "fotos"]) assert.equal(Object.hasOwn(chamada.opcoes.body, campo), false);
});
test("UF/categoria/condição inválidas não chegam à API", async () => {
  for (const extra of [{ uf: "ZZ" }, { categoria_id: "../admin" }, { condicao_item: "PROIBIDO" }]) {
    const app = ambiente(); assert.equal((await app.criar(form({ ...campos, ...extra }))).sucesso, false); assert.equal(app.chamadas.length, 0);
  }
});
test("interesse só envia item e mensagem e limita texto", async () => {
  const app = ambiente();
  assert.equal((await app.manifestarInteresse(vazio, form({ item_id: itemId, mensagem_interessado: " Gostaria da mesa. ", usuario_interessado_id: "outro", status: "ACEITO" }))).sucesso, true);
  const payload = app.chamadas.at(-1).opcoes.body;
  assert.deepEqual(JSON.parse(JSON.stringify(payload)), { item_id: itemId, mensagem_interessado: "Gostaria da mesa." });
  assert.equal((await app.manifestarInteresse(vazio, form({ item_id: itemId, mensagem_interessado: "x".repeat(2001) }))).sucesso, false);
  assert.equal(app.chamadas.length, 1);
});
test("denúncia do doador deriva alvo do anúncio em vez de aceitar ID do cliente", async () => {
  const app = ambiente();
  const resultado = await app.denunciarDoacao(vazio, form({ item_id: itemId, tipo_alvo: "USUARIO", motivo: "FRAUDE", descricao: "", alvo_usuario_id: interessadoId, denunciante_id: "outro" }));
  assert.equal(resultado.sucesso, true);
  assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas.at(-1).opcoes.body)), { tipo_alvo: "USUARIO", motivo: "FRAUDE", alvo_usuario_id: usuarioId });
});
test("avaliação deriva participante e sentido; visitante e item aberto são bloqueados", async () => {
  for (const options of [{ usuario: "60000000-0000-0000-0000-000000000001" }, { status: "DISPONIVEL" }]) {
    const app = ambiente(options); assert.equal((await app.avaliarDoacao(vazio, form({ item_id: itemId, nota: "5", comentario: "" }))).sucesso, false);
    assert.equal(app.chamadas.filter(c => c.opcoes?.metodo === "POST").length, 0);
  }
  const app = ambiente({ usuario: interessadoId });
  assert.equal((await app.avaliarDoacao(vazio, form({ item_id: itemId, nota: "5", comentario: " Ótima experiência. ", avaliado_id: "outro", tipo: "DOADOR_PARA_INTERESSADO" }))).sucesso, true);
  const payload = app.chamadas.at(-1).opcoes.body;
  assert.equal(payload.avaliado_id, usuarioId); assert.equal(payload.tipo, "INTERESSADO_PARA_DOADOR"); assert.equal(payload.comentario, "Ótima experiência.");
});
test("redirecionamento de sessão expirada não vira mensagem comum", async () => {
  const erro = Object.assign(new Error("Sessão expirada"), { redirect: true });
  const app = ambiente({ erro });
  await assert.rejects(() => app.criar(form(campos)), e => e === erro);
  await assert.rejects(() => app.manifestarInteresse(vazio, form({ item_id: itemId, mensagem_interessado: "" })), e => e === erro);
});
test("fotos rejeitam SVG, arquivo vazio, mais de cinco e tamanho excedido", () => {
  const app = ambiente(); const jpeg = () => new File(["x"], "foto.jpg", { type: "image/jpeg" });
  assert.doesNotThrow(() => app.validar.validarFotos([jpeg()]));
  for (const fotos of [[new File(["x"], "x.svg", { type: "image/svg+xml" })], [new File([], "x.png", { type: "image/png" })], Array.from({ length: 6 }, jpeg), [new File([new Uint8Array(4 * 1024 * 1024 + 1)], "x.png", { type: "image/png" })]]) {
    assert.throws(() => app.validar.validarFotos(fotos));
  }
});
