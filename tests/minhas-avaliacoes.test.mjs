import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const JSX = {
  jsx: (type, props, key) => ({ type, props: { ...props, ...(key === undefined ? {} : { key }) } }),
  jsxs: (type, props, key) => ({ type, props: { ...props, ...(key === undefined ? {} : { key }) } }),
};

function arvore(elemento, predicado, encontrados = []) {
  if (Array.isArray(elemento)) {
    for (const filho of elemento) arvore(filho, predicado, encontrados);
    return encontrados;
  }
  if (!elemento || typeof elemento !== "object" || !("type" in elemento)) return encontrados;
  if (typeof elemento.type === "function") {
    arvore(elemento.type(elemento.props), predicado, encontrados);
    return encontrados;
  }
  if (predicado(elemento)) encontrados.push(elemento);
  arvore(elemento.props?.children, predicado, encontrados);
  return encontrados;
}

function texto(elemento) {
  if (typeof elemento === "string" || typeof elemento === "number") return String(elemento);
  if (Array.isArray(elemento)) return elemento.map(texto).join("");
  return elemento?.props ? texto(elemento.props.children) : "";
}

function carregarPagina({ usuario, resposta }) {
  const chamadas = [];
  const avaliacaoCard = "AvaliacaoCard";
  const contexto = {
    exports: {},
    URLSearchParams,
    AbortSignal,
    require(nome) {
      if (nome === "react/jsx-runtime") return JSX;
      if (nome === "next/link") return { __esModule: true, default: "Link" };
      if (nome === "@/components/perfil/avaliacao-card") return { AvaliacaoCard: avaliacaoCard };
      if (nome === "@/lib/auth-server") return {
        getUsuarioLogado: async () => usuario,
        fetchApiAutenticado: async (rota, opcoes) => {
          chamadas.push({ rota, opcoes });
          return resposta(opcoes.params);
        },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  const fonte = readFileSync(new URL("../app/(protected)/perfil/minhas-avaliacoes/page.tsx", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, contexto);
  return { pagina: contexto.exports.default, chamadas, avaliacaoCard };
}

function avaliacao(id, avaliadorId, avaliadoId, data = "2026-08-01T12:00:00.000Z") {
  return {
    _id: id,
    item_id: { _id: `item-${id}`, titulo: `Doação ${id}` },
    avaliador_id: { _id: avaliadorId, nome: `Autor ${avaliadorId}` },
    avaliado_id: { _id: avaliadoId, nome: `Pessoa ${avaliadoId}` },
    nota: 4,
    comentario: "Comentário de teste",
    tipo: "DOADOR_PARA_INTERESSADO",
    data_avaliacao: data,
  };
}

function paginado(docs, page = 1, totalPages = 1) {
  return {
    docs,
    totalDocs: totalPages * 20,
    limit: 20,
    totalPages,
    page,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}

function usuario(perfil = "USUARIO") {
  return { _id: "usuario-atual", nome: "Pessoa Atual", perfil, media_avaliacoes: 4.2, total_avaliacoes: 3 };
}

test("usuário comum recebe página paginada do endpoint que a API restringe ao próprio usuário", async () => {
  const app = carregarPagina({
    usuario: usuario(),
    resposta: ({ page }) => paginado([
      avaliacao("feita-antiga", "usuario-atual", "outro", "2026-08-01T12:00:00.000Z"),
      avaliacao("recebida", "outro", "usuario-atual"),
    ], Number(page), 3),
  });

  const view = await app.pagina({ searchParams: Promise.resolve({ page: "2" }) });
  const cards = arvore(view, (elemento) => elemento.type === app.avaliacaoCard);
  const params = app.chamadas.map(({ rota, opcoes }) => ({ rota, ...opcoes.params }));

  assert.deepEqual(JSON.parse(JSON.stringify(params)), [{ rota: "avaliacoes", page: 2, limite: 20 }]);
  assert.deepEqual(cards.map(({ props }) => ({ id: props.id, feitaPorMim: props.feitaPorMim })), [
    { id: "feita-antiga", feitaPorMim: true },
    { id: "recebida", feitaPorMim: false },
  ]);
  assert.equal(cards[0].props.editavel, undefined, "a idade da avaliação não deve desabilitar edição do autor");
  assert.ok(arvore(view, (elemento) => elemento.type === "Link").some(({ props }) => props.href === "?page=3"));
  assert.doesNotMatch(texto(view), /janela de 30 dias|edição permitida por até 30 dias/i);
});

test("conta administrativa consulta somente avaliações próprias e recebidas, com páginas independentes", async () => {
  const app = carregarPagina({
    usuario: usuario("ADMINISTRADOR"),
    resposta: (params) => params.avaliador_id
      ? paginado([avaliacao("admin-fez", "usuario-atual", "outra-pessoa")], Number(params.page), 4)
      : paginado([avaliacao("admin-recebeu", "terceiro", "usuario-atual")], Number(params.page), 5),
  });

  const view = await app.pagina({ searchParams: Promise.resolve({ feitas: "2", recebidas: "3" }) });
  const parametros = app.chamadas.map(({ rota, opcoes }) => ({ rota, ...opcoes.params }));
  const cards = arvore(view, (elemento) => elemento.type === app.avaliacaoCard);
  const links = arvore(view, (elemento) => elemento.type === "Link").map(({ props }) => props.href);

  assert.deepEqual(JSON.parse(JSON.stringify(parametros)), [
    { rota: "avaliacoes", avaliador_id: "usuario-atual", page: 2, limite: 20 },
    { rota: "avaliacoes", avaliado_id: "usuario-atual", page: 3, limite: 20 },
  ]);
  assert.deepEqual(cards.map(({ props }) => ({ id: props.id, feitaPorMim: props.feitaPorMim })), [
    { id: "admin-fez", feitaPorMim: true },
    { id: "admin-recebeu", feitaPorMim: false },
  ]);
  assert.ok(links.includes("?feitas=1&recebidas=3"));
  assert.ok(links.includes("?feitas=3&recebidas=3"));
  assert.ok(links.includes("?feitas=2&recebidas=2"));
  assert.ok(links.includes("?feitas=2&recebidas=4"));
});

test("página solicitada além do fim retorna para a última página existente", async () => {
  const app = carregarPagina({
    usuario: usuario(),
    resposta: ({ page }) => paginado([avaliacao("ultima", "usuario-atual", "outro")], Number(page) === 99 ? 99 : 2, 2),
  });

  await app.pagina({ searchParams: Promise.resolve({ page: "99" }) });
  assert.deepEqual(app.chamadas.map(({ opcoes }) => opcoes.params.page), [99, 2]);
});

test("parâmetro de página repetido é tratado como inválido e não vira filtro ambíguo", async () => {
  const app = carregarPagina({ usuario: usuario(), resposta: ({ page }) => paginado([], Number(page), 1) });
  await app.pagina({ searchParams: Promise.resolve({ page: ["2", "3"] }) });
  assert.deepEqual(app.chamadas.map(({ opcoes }) => opcoes.params.page), [1]);
});

function carregarCard({ atualizar = async () => undefined, remover = async () => undefined, confirmar = true } = {}) {
  const estados = [];
  const chamadas = [];
  const pendencias = [];
  let cursor = 0;
  let confirmarAtual = confirmar;
  const contexto = {
    exports: {},
    window: { confirm: () => confirmarAtual },
    require(nome) {
      if (nome === "react") return {
        useState(inicial) {
          const indice = cursor++;
          if (!(indice in estados)) estados[indice] = inicial;
          return [estados[indice], (valor) => { estados[indice] = typeof valor === "function" ? valor(estados[indice]) : valor; }];
        },
        useTransition: () => [false, (trabalho) => { pendencias.push(Promise.resolve(trabalho())); }],
      };
      if (nome === "react/jsx-runtime") return JSX;
      if (nome === "lucide-react") return { Star: "Star", Pencil: "Pencil", Trash2: "Trash2" };
      if (nome === "@/lib/utils") return { cn: (...valores) => valores.filter(Boolean).join(" ") };
      if (nome === "@/app/(protected)/perfil/minhas-avaliacoes/actions") return {
        atualizarAvaliacao: async (...args) => { chamadas.push({ acao: "atualizar", args }); return atualizar(...args); },
        removerAvaliacao: async (...args) => { chamadas.push({ acao: "remover", args }); return remover(...args); },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  const fonte = readFileSync(new URL("../components/perfil/avaliacao-card.tsx", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, contexto);

  const props = {
    id: "avaliacao-1", autor: "Você avaliou outra pessoa", estrelas: 4, tempo: "há 45 dias",
    texto: "Comentário original", item: "Doação 1", feitaPorMim: true,
  };
  return {
    chamadas,
    setConfirmar(valor) { confirmarAtual = valor; },
    render() { cursor = 0; return contexto.exports.AvaliacaoCard(props); },
    async aguardar() { await Promise.all(pendencias.splice(0)); },
  };
}

test("autor consegue editar avaliação antiga e a ação recebe nota e comentário atualizados", async () => {
  const app = carregarCard();
  let view = app.render();
  arvore(view, (elemento) => elemento.type === "button" && texto(elemento).includes("Editar"))[0].props.onClick();
  view = app.render();

  const campo = arvore(view, (elemento) => elemento.type === "textarea")[0];
  assert.ok(campo, "clicar em Editar deve abrir os campos de edição");
  assert.equal(campo.props["aria-label"], "Comentário da avaliação");
  assert.equal(campo.props.maxLength, 2000, "edição preserva o limite de comentário aceito pela API");
  campo.props.onChange({ target: { value: "Comentário atualizado" } });
  arvore(view, (elemento) => elemento.type === "button" && elemento.props["aria-label"] === "Nota 5")[0].props.onClick();
  view = app.render();
  assert.equal(arvore(view, (elemento) => elemento.type === "button" && elemento.props["aria-label"] === "Nota 5")[0].props["aria-pressed"], true);
  arvore(view, (elemento) => elemento.type === "button" && texto(elemento).includes("Salvar"))[0].props.onClick();
  await app.aguardar();

  assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas)), [{
    acao: "atualizar",
    args: ["avaliacao-1", { nota: 5, comentario: "Comentário atualizado" }],
  }]);
  assert.equal(arvore(app.render(), (elemento) => elemento.type === "textarea").length, 0, "sucesso fecha o editor");
});

test("remoção exige confirmação, mantém o cartão e mostra erro recuperável quando a API falha", async () => {
  const app = carregarCard({ remover: async () => ({ erro: "API indisponível" }), confirmar: false });
  let view = app.render();
  arvore(view, (elemento) => elemento.type === "button" && texto(elemento).includes("Remover"))[0].props.onClick();
  assert.equal(app.chamadas.length, 0, "cancelar a confirmação não envia DELETE");

  app.setConfirmar(true);
  view = app.render();
  arvore(view, (elemento) => elemento.type === "button" && texto(elemento).includes("Remover"))[0].props.onClick();
  await app.aguardar();

  view = app.render();
  assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas)), [{ acao: "remover", args: ["avaliacao-1"] }]);
  assert.match(texto(arvore(view, (elemento) => elemento.props?.role === "alert")[0]), /API indisponível/);
  assert.equal(arvore(view, (elemento) => elemento.type === "button" && texto(elemento).includes("Remover")).length, 1);
});

function carregarAcoes(falha) {
  const chamadas = [];
  const revalidacoes = [];
  class ErroApi extends Error {}
  const contexto = {
    exports: {},
    AbortSignal,
    require(nome) {
      if (nome === "next/cache") return { revalidatePath: (path) => revalidacoes.push(path) };
      if (nome === "next/navigation") return { unstable_rethrow: (erro) => { if (erro?.redirecionar) throw erro; } };
      if (nome === "@/lib/api") return { ErroApi };
      if (nome === "@/lib/auth-server") return {
        fetchApiAutenticado: async (rota, opcoes) => {
          chamadas.push({ rota, opcoes });
          if (falha) throw falha;
          return {};
        },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  const fonte = readFileSync(new URL("../app/(protected)/perfil/minhas-avaliacoes/actions.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, contexto);
  return { acoes: contexto.exports, chamadas, revalidacoes };
}

test("ações editam e removem pelo contrato da API e revalidam a lista", async () => {
  const app = carregarAcoes();
  await app.acoes.atualizarAvaliacao("id com espaço", { nota: 5, comentario: " comentário " });
  await app.acoes.removerAvaliacao("avaliacao-2");

  assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas.map(({ rota, opcoes }) => ({ rota, metodo: opcoes.metodo, body: opcoes.body })))), [
    { rota: "avaliacoes/id%20com%20espa%C3%A7o", metodo: "PUT", body: { nota: 5, comentario: "comentário" } },
    { rota: "avaliacoes/avaliacao-2", metodo: "DELETE" },
  ]);
  assert.ok(app.chamadas.every(({ opcoes }) => opcoes.signal instanceof AbortSignal));
  assert.deepEqual(JSON.parse(JSON.stringify(app.revalidacoes)), ["/perfil/minhas-avaliacoes", "/perfil/minhas-avaliacoes"]);
});

test("falha da API não revalida a lista e retorna mensagem para recuperação na tela", async () => {
  const app = carregarAcoes(new Error("conexão indisponível"));
  const resultado = await app.acoes.removerAvaliacao("avaliacao-3");

  assert.deepEqual(JSON.parse(JSON.stringify(resultado)), { erro: "Não foi possível falar com o servidor. Tente novamente." });
  assert.deepEqual(JSON.parse(JSON.stringify(app.revalidacoes)), []);
});
