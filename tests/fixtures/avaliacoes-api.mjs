import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 19051);
const uid = "usuario-atual";
const adminId = "admin-atual";
const terceirosId = "terceiro";

function avaliacao(id, avaliadorId, avaliadoId, item, data, comentario) {
  return {
    _id: id,
    item_id: { _id: `item-${id}`, titulo: item },
    avaliador_id: { _id: avaliadorId, nome: avaliadorId === uid ? "Maria QA" : `Autor ${avaliadorId}` },
    avaliado_id: { _id: avaliadoId, nome: avaliadoId === uid ? "Maria QA" : `Pessoa ${avaliadoId}` },
    nota: 4,
    comentario,
    tipo: "DOADOR_PARA_INTERESSADO",
    data_avaliacao: data,
  };
}

const originais = [
  avaliacao("avaliacao-antiga", uid, terceirosId, "Doação antiga", "2026-06-01T12:00:00.000Z", "Comentário antigo"),
  avaliacao("avaliacao-recebida", terceirosId, uid, "Doação recebida", "2026-10-01T12:00:00.000Z", "Comentário recebido"),
  avaliacao("avaliacao-admin-feita", adminId, terceirosId, "Doação do admin", "2026-10-02T12:00:00.000Z", "Comentário admin"),
  avaliacao("avaliacao-admin-recebida", terceirosId, adminId, "Doação recebida pelo admin", "2026-10-03T12:00:00.000Z", "Comentário recebido admin"),
  avaliacao("avaliacao-terceiros", "pessoa-a", "pessoa-b", "Registro de terceiros", "2026-10-04T12:00:00.000Z", "Não deve aparecer"),
  avaliacao("avaliacao-admin-feita-2", adminId, "pessoa-c", "Outra doação do admin", "2026-09-01T12:00:00.000Z", "Comentário admin antigo"),
  avaliacao("avaliacao-admin-recebida-2", "pessoa-d", adminId, "Outra doação recebida", "2026-08-01T12:00:00.000Z", "Comentário recebido admin antigo"),
  avaliacao("avaliacao-admin-recebida-3", "pessoa-e", adminId, "Terceira doação recebida", "2026-07-01T12:00:00.000Z", "Comentário recebido admin mais antigo"),
];

let avaliacoes = structuredClone(originais);
let requests = [];

function responder(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
}

async function corpo(req) {
  const pedacos = [];
  for await (const pedaco of req) pedacos.push(pedaco);
  return pedacos.length ? JSON.parse(Buffer.concat(pedacos).toString("utf8")) : undefined;
}

function paginar(docs, page, totalPages = 1) {
  return {
    docs,
    totalDocs: Math.max(docs.length, totalPages * 20),
    limit: 20,
    totalPages,
    page,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const currentId = token === "admin-fixture" ? adminId : uid;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const method = req.method ?? "GET";
  let payload;

  if (url.pathname === "/__test/reset" && method === "POST") {
    avaliacoes = structuredClone(originais);
    requests = [];
    return responder(res, 200, { data: { reset: true } });
  }
  if (url.pathname === "/__test/state" && method === "GET") {
    return responder(res, 200, { data: { requests, ids: avaliacoes.map(({ _id }) => _id), avaliacoes } });
  }
  if (url.pathname === "/perfil" && method === "GET") {
    return responder(res, 200, { data: {
      _id: currentId, nome: currentId === adminId ? "Admin QA" : "Maria QA", email: "qa@example.test",
      cpf: "00000000000", telefone: null, cidade: "Vilhena", uf: "RO", foto_perfil: null, bio: null,
      perfil: currentId === adminId ? "ADMINISTRADOR" : "USUARIO", situacao: "ATIVO",
      media_avaliacoes: 4.2, total_avaliacoes: 2, total_doacoes: 0, data_cadastro: "2026-01-01T00:00:00.000Z",
    } });
  }
  if (url.pathname === "/notificacoes/contador" && method === "GET") {
    return responder(res, 200, { data: { nao_lidas: 0 } });
  }
  if (url.pathname === "/avaliacoes" && method === "GET") {
    let docs;
    let totalPages = 1;
    const autor = url.searchParams.get("avaliador_id");
    const avaliado = url.searchParams.get("avaliado_id");
    if (autor) {
      docs = avaliacoes.filter((item) => item.avaliador_id._id === autor);
      if (autor === adminId) totalPages = 2;
    } else if (avaliado) {
      docs = avaliacoes.filter((item) => item.avaliado_id._id === avaliado);
      if (avaliado === adminId) totalPages = 3;
    } else {
      docs = avaliacoes.filter((item) => item.avaliador_id._id === currentId || item.avaliado_id._id === currentId);
      totalPages = 2;
    }
    docs = docs.sort((a, b) => b.data_avaliacao.localeCompare(a.data_avaliacao));
    docs = docs.slice(page - 1, page);
    payload = paginar(docs, page, totalPages);
    requests.push({ method, path: url.pathname, page, avaliador_id: autor, avaliado_id: avaliado });
    return responder(res, 200, { data: payload });
  }
  if (url.pathname.startsWith("/avaliacoes/") && (method === "PUT" || method === "DELETE")) {
    const id = decodeURIComponent(url.pathname.slice("/avaliacoes/".length));
    const item = avaliacoes.find((avaliacaoAtual) => avaliacaoAtual._id === id);
    if (!item || item.avaliador_id._id !== currentId) return responder(res, 403, { errors: ["Apenas o autor pode alterar esta avaliação."] });
    const dados = method === "PUT" ? await corpo(req) : undefined;
    requests.push({ method, path: url.pathname, body: dados });
    if (method === "PUT") Object.assign(item, dados);
    else avaliacoes = avaliacoes.filter((avaliacaoAtual) => avaliacaoAtual._id !== id);
    return responder(res, method === "DELETE" ? 204 : 200, method === "DELETE" ? undefined : { data: item });
  }

  responder(res, 404, { errors: ["Rota de fixture não encontrada."] });
});

server.listen(port, "127.0.0.1", () => process.stdout.write(`Fixture API pronta em http://127.0.0.1:${port}\n`));
