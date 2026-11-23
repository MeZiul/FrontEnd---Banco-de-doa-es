import { API_LOCAL } from "../support/conta-sintetica";

// Usa o admin do seed local: rode com CYPRESS_ADMIN_EMAIL e CYPRESS_ADMIN_SENHA. Não grava nada no banco.
describe("Dashboard administrativo ao vivo", () => {
  beforeEach(() => {
    cy.env<{ ADMIN_EMAIL: string; ADMIN_SENHA: string }>(["ADMIN_EMAIL", "ADMIN_SENHA"], { log: false })
      .then(({ ADMIN_EMAIL, ADMIN_SENHA }) => cy.request({
        method: "POST",
        url: `${API_LOCAL}/api/auth/sign-in/email`,
        headers: { origin: Cypress.config("baseUrl") },
        body: { email: ADMIN_EMAIL, password: ADMIN_SENHA },
        log: false,
      }))
      .its("body.token")
      .then((token) => cy.setCookie("doai_token", token, { log: false }));
  });

  it("mostra os seis indicadores e conecta a atualização automática", () => {
    cy.visit("/admin/dashboard");
    cy.get("[data-metrica]").should("have.length", 6);
    cy.get('[data-test="estadoAoVivo"]', { timeout: 15000 }).should("contain", "Ao vivo");
    cy.contains("Indisponível").should("not.exist");
  });
});