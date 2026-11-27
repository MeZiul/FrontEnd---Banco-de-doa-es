// [E2E] [DASHBOARD] Testes do dashboard ST-25: métricas ao vivo.

describe("Suite Dashboard – ST-25", () => {
  beforeEach(() => {
    cy.loginAdmin();
  });

  it("ST-25 – Dashboard com métricas ao vivo", () => {
    cy.visit("/admin/dashboard");
    cy.get("[data-metrica]").should("have.length", 6);
    cy.get('[data-test="estadoAoVivo"]', { timeout: 15000 }).should("contain", "Ao vivo");
    cy.contains("Indisponível").should("not.exist");
  });
});
