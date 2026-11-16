import assert from "node:assert/strict";
import { test } from "node:test";
import { campoDoacao, ID_DOACAO, lerNovaDoacao } from "../lib/doacao-validation.ts";

function form(campos) {
  const dados = new FormData();
  for (const [nome, valor] of Object.entries(campos)) dados.set(nome, valor);
  return dados;
}

test("campoDoacao apara o texto e devolve vazio para campo ausente ou arquivo", () => {
  const dados = form({ titulo: "  Mesa  ", foto: new File(["x"], "x.png") });
  assert.equal(campoDoacao(dados, "titulo"), "Mesa");
  assert.equal(campoDoacao(dados, "ausente"), "");
  assert.equal(campoDoacao(dados, "foto"), "");
});

test("ID_DOACAO aceita ObjectId e UUID e recusa o que não pode entrar na URL da API", () => {
  for (const id of ["507f1f77bcf86cd799439011", "20000000-0000-0000-0000-000000000001"]) {
    assert.equal(ID_DOACAO.test(id), true);
  }
  for (const id of ["", "../admin", "507f1f77bcf86cd79943901", "20000000-0000-0000-0000-000000000001/ler", "507f1f77bcf86cd799439011\n"]) {
    assert.equal(ID_DOACAO.test(id), false);
  }
});

test("nova doação encaminha só os campos do anúncio, com UF em maiúsculas", () => {
  const dados = form({ titulo: " Mesa ", descricao: " Mesa de estudos ", categoria_id: "cat", condicao_item: "NOVO", cidade: " Vilhena ", uf: " ro ", bairro: "", condicoes_doacao: "", usuario_id: "outro", status: "DOADO" });
  assert.deepEqual(lerNovaDoacao(dados), {
    titulo: "Mesa", descricao: "Mesa de estudos", categoria_id: "cat", condicao_item: "NOVO",
    cidade: "Vilhena", uf: "RO", bairro: "", condicoes_doacao: "",
  });
});

test("nova doação deixa tamanho, categoria, condição e UF para o Zod da API", () => {
  const dados = form({ titulo: "x", descricao: "curta", categoria_id: "../admin", condicao_item: "PROIBIDO", uf: "ZZ" });
  const lidos = lerNovaDoacao(dados);
  assert.equal(lidos.titulo, "x");
  assert.equal(lidos.descricao, "curta");
  assert.equal(lidos.categoria_id, "../admin");
  assert.equal(lidos.condicao_item, "PROIBIDO");
  assert.equal(lidos.uf, "ZZ");
  assert.equal(lidos.cidade, "");
});
