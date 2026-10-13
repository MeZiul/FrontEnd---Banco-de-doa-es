import { API_LOCAL, criarContaSintetica } from "../support/conta-sintetica";

describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
    // Espera o React "assumir" o formulário antes de digitar (no `next dev` isso demora).
    cy.get('[data-test="credencialLogin"]').should(($campo) => {
      expect(Object.keys($campo[0]).some((chave) => chave.startsWith("__reactProps"))).to.equal(true);
    });
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

    // Sem ?redirect= na URL, o login leva para a página inicial.
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.getCookie("doai_token").should("exist");
  });
});
