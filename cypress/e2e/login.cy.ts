describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("exibe a tela de login", () => {
    cy.get('[data-test="paginaLogin"]').should("be.visible");
    cy.get('[data-test="credencialLogin"]').should("be.visible");
    cy.get('[data-test="senhaLogin"]').should("be.visible");
    cy.get('[data-test="buttonEntrar"]').should("be.visible");
  });

  it("faz login com e-mail e senha", () => {
    cy.get('[data-test="credencialLogin"]').type("joao@email.com");
    cy.get('[data-test="senhaLogin"]').type("Senha@123");
    cy.get('[data-test="buttonEntrar"]').click();

    cy.url().should("include", "/itens-doacao");
  });
});
