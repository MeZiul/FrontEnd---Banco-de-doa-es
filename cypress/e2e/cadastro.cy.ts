import { criarContaSintetica } from "../support/conta-sintetica";

describe("Cadastro", () => {
  beforeEach(() => {
    cy.visit("/cadastro");
    // Espera o React "assumir" o formulário antes de digitar. No `next dev` isso demora,
    // e o que for digitado antes se perde (o primeiro campo ficava vazio).
    cy.get('[data-test="nomeCadastro"]').should(($campo) => {
      expect(Object.keys($campo[0]).some((chave) => chave.startsWith("__reactProps"))).to.equal(true);
    });
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

    // UF é um select customizado: abre e clica na opção
    cy.get('[data-test="ufCadastro"]').click();
    cy.get('[data-test="opcaoUfRO"]').click();

    // Cidade: carrega as cidades da UF na API do IBGE; digita para buscar e clica na opção
    cy.get('[data-test="cidadeCadastro"]', { timeout: 10000 }).should("not.be.disabled").type("Vilh");
    cy.get('[data-test="opcaoCidade-vilhena"]').click();
    cy.get('[data-test="cidadeCadastro"]').should("have.value", "Vilhena");

    cy.get('[data-test="senhaCadastro"]').type(conta.senha, { log: false });
    cy.get('[data-test="confirmarSenhaCadastro"]').type(conta.senha, { log: false });
    cy.get('[data-test="termosCadastro"]').check();
    cy.get('[data-test="buttonCriarConta"]').click();

    // Criar a conta (hash da senha na API) pode passar dos 4s padrão do Cypress no `next dev`.
    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.location("search").should("eq", "?cadastro=sucesso");
    cy.contains('[role="status"]', "Conta criada com sucesso. Entre com seu e-mail e senha.").should("be.visible");
    cy.getCookie("doai_token").should("be.null");
  });
});
