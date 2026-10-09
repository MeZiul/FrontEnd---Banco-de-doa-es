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
    cy.get('[data-test="nomeCadastro"]').type("Maria da Silva");
    cy.get('[data-test="emailCadastro"]').type("maria.cypress@email.com");
    cy.get('[data-test="cpfCadastro"]').type("123.456.789-09");
    cy.get('[data-test="telefoneCadastro"]').type("(69) 99999-0000");
    cy.get('[data-test="cidadeCadastro"]').type("Vilhena");

    // UF é um select customizado: abre e clica na opção
    cy.get('[data-test="ufCadastro"]').click();
    cy.get('[data-test="opcaoUfRO"]').click();

    cy.get('[data-test="senhaCadastro"]').type("Senha@123");
    cy.get('[data-test="confirmarSenhaCadastro"]').type("Senha@123");
    cy.get('[data-test="termosCadastro"]').check();
    cy.get('[data-test="buttonCriarConta"]').click();

    cy.url().should("include", "/perfil/editar");
  });
});
