import { criarContaSintetica } from "../support/conta-sintetica";

describe("Cadastro", () => {
  beforeEach(() => {
    cy.visit("/cadastro");
  });

  it("exibe a tela de cadastro", () => {
    cy.get('[data-test="paginaCadastro"]').should("be.visible");
    cy.get('[data-test="nomeCadastro"]').should("be.visible");
    cy.get('[data-test="emailCadastro"]').should("be.visible");
    cy.get('[data-test="buttonCriarConta"]').should("be.visible");
  });

  it("cria uma conta nova", () => {
    const conta = criarContaSintetica();
    cy.get('[data-test="nomeCadastro"]').type(conta.nome);
    cy.get('[data-test="emailCadastro"]').type(conta.email);
    cy.get('[data-test="cpfCadastro"]').type(conta.cpf);
    cy.get('[data-test="telefoneCadastro"]').type("(69) 99999-0000");
    cy.get('[data-test="cidadeCadastro"]').type("Vilhena");

    // UF é um select customizado: abre e clica na opção
    cy.get('[data-test="ufCadastro"]').click();
    cy.get('[data-test="opcaoUfRO"]').click();

    cy.get('[data-test="senhaCadastro"]').type(conta.senha, { log: false });
    cy.get('[data-test="confirmarSenhaCadastro"]').type(conta.senha, { log: false });
    cy.get('[data-test="termosCadastro"]').check();
    cy.get('[data-test="buttonCriarConta"]').click();

    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("eq", "?cadastro=sucesso");
    cy.contains('[role="status"]', "Conta criada com sucesso. Entre com seu e-mail e senha.").should("be.visible");
    cy.getCookie("doai_token").should("be.null");
  });
});
