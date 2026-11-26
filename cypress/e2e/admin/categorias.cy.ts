// [E2E][CATEGORIAS] Testes de categorias ST-12 a ST-16: criação, edição, inativação e exclusão de categorias.

import { comoAdmin, criarPessoa, tokenAdmin, unico } from "../../support/api";
import { API_LOCAL } from "../../support/conta-sintetica";

// Categorias criadas aqui são apagadas no fim de cada teste, para não poluir os formulários reais.
describe("Suite Categorias – ST-12 a ST-16", () => {
  let criadas: string[] = [];

  beforeEach(() => {
    criadas = [];
    cy.loginAdmin();
  });

  afterEach(() => {
    tokenAdmin().then((token) => {
      for (const id of criadas) {
        cy.request({ method: "DELETE", url: `${API_LOCAL}/categorias/${id}`, headers: { authorization: `Bearer ${token}` }, failOnStatusCode: false, log: false });
      }
    });
  });

  function criarPelaApi(nome: string, ordem = 0) {
    return comoAdmin<{ _id: string }>("POST", "categorias", { nome, ordem, ativo: true }).then((categoria) => {
      criadas.push(categoria._id);
      return categoria;
    });
  }

  const card = (nome: string) => cy.contains("li h2", nome, { timeout: 15000 }).closest("li").as("card");

  it("ST-12 – Criar categoria e recusar nome repetido", () => {
    const nome = `Categoria QA ${unico()}`;
    cy.visit("/admin/categorias");
    cy.get("#nova-categoria-nome").hidratado().type(nome);
    cy.get("#nova-categoria-ordem").clear().type("0");
    cy.get("#nova-categoria-descricao").type("Criada pelo teste Cypress.");
    cy.contains("button", "Criar categoria").click();
    cy.contains('[role="status"]', "Categoria criada.").should("be.visible");
    card(nome).within(() => {
      cy.contains("Ativa");
      cy.contains("Criada pelo teste Cypress.");
    });
    // Guarda o id para a limpeza.
    comoAdmin<{ docs: { _id: string; nome: string }[] }>("GET", "admin/categorias?limite=100")
      .then(({ docs }) => criadas.push(...docs.filter((c) => c.nome === nome).map((c) => c._id)));

    cy.get("#nova-categoria-nome").type(nome);
    cy.contains("button", "Criar categoria").click();
    cy.get('section[aria-labelledby="titulo-nova-categoria"] [role="alert"]').should("be.visible");
    cy.get("#nova-categoria-nome").should("have.value", nome);
  });

  it("ST-13 – Nome da categoria obrigatório", () => {
    cy.visit("/admin/categorias");
    // minLength só é checado pelo navegador em digitação real; o Cypress preenche por script, então confere o atributo.
    cy.get("#nova-categoria-nome").hidratado().should("have.attr", "minlength", "2").and("have.attr", "maxlength", "60");
    cy.contains("button", "Criar categoria").click();
    cy.get("#nova-categoria-nome").then(($campo) => {
      expect(($campo[0] as HTMLInputElement).validity.valueMissing).to.equal(true);
    });
    cy.contains('[role="status"]', "Categoria criada.").should("not.exist");
  });

  it("ST-14 – Editar categoria", () => {
    const nome = `Categoria QA ${unico()}`;
    const novoNome = `${nome} editada`;
    criarPelaApi(nome);
    cy.visit("/admin/categorias");
    card(nome).contains("button", "Editar").hidratado().click();
    cy.get("@card").find('input[name="nome"]').clear().type(novoNome);
    cy.get("@card").find('input[name="ordem"]').clear().type("1");
    cy.get("@card").contains("button", "Salvar alterações").click();
    card(novoNome).contains("Ordem 1");
  });

  it("ST-15 – Categoria inativa some da nova doação", () => {
    const nome = `Categoria QA ${unico()}`;
    criarPelaApi(nome);
    cy.visit("/admin/categorias");
    card(nome).contains("button", "Editar").hidratado().click();
    cy.get("@card").find('input[name="ativo"]').uncheck();
    cy.get("@card").contains("button", "Salvar alterações").click();
    card(nome).contains("Inativa");

    criarPessoa("Anunciante").then((pessoa) => {
      cy.usarSessao(pessoa.token);
      cy.visit("/doacoes/nova");
      cy.get('select[name="categoria_id"]').should("not.contain", nome);
    });

    cy.loginAdmin();
    cy.visit("/admin/categorias");
    card(nome).contains("button", "Editar").hidratado().click();
    cy.get("@card").find('input[name="ativo"]').check();
    cy.get("@card").contains("button", "Salvar alterações").click();
    card(nome).contains("Ativa");
  });

  it("ST-16 – Excluir categoria com confirmação", () => {
    const nome = `Categoria QA ${unico()}`;
    criarPelaApi(nome);
    const confirmar = cy.stub().as("confirm");
    confirmar.onFirstCall().returns(false).onSecondCall().returns(true);
    cy.on("window:confirm", confirmar);

    cy.visit("/admin/categorias");
    card(nome).contains("button", "Excluir").hidratado().click();
    cy.get("@confirm").should("have.been.calledOnce");
    card(nome).should("exist");

    cy.get("@card").contains("button", "Excluir").click();
    cy.contains("li h2", nome).should("not.exist");
  });
});
