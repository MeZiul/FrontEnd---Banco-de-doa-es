import { API_LOCAL, criarContaSintetica } from "../support/conta-sintetica";

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
    const conta = criarContaSintetica();
    cy.request({ method: "POST", url: `${API_LOCAL}/usuario`, body: conta, log: false })
      .its("status").should("eq", 201);
    cy.get('[data-test="credencialLogin"]').type(conta.email);
    cy.get('[data-test="senhaLogin"]').type(conta.senha, { log: false });
    cy.get('[data-test="buttonEntrar"]').click();

    cy.url().should("include", "/itens-doacao");
    cy.getCookie("doai_token").should("exist");
  });
});
