// [E2E] [AUDITORIA] Testes de auditoria ST-20 e ST-21: cancelamento de anúncio e bloqueio de usuário.

import { comoAdmin, criarAnuncio, criarPessoa } from "../../support/api";

// Cada ação de moderação deixa rastro: a ação é feita pela API e o registro é conferido na tela, com os filtros.
describe("Suite Auditoria – ST-20 e ST-21", () => {
  const registro = (texto: string) => cy.contains('[data-slot="card"]', texto, { timeout: 15000 });

  beforeEach(() => {
    cy.loginAdmin();
  });

  it("ST-20 – Auditoria do cancelamento de anúncio", () => {
    criarPessoa("Doador").then((doador) => criarAnuncio(doador)).then((anuncio) => {
      comoAdmin("PUT", `admin/itens/${anuncio._id}/cancelar`, { motivo: "Cancelado para o teste de auditoria." });

      cy.visit("/admin/auditoria");
      cy.get("#filtros-auditoria-tipo_acao").hidratado().select("CANCELAMENTO_ITEM");
      cy.contains("button", "Filtrar").click();
      cy.location("search").should("contain", "tipo_acao=CANCELAMENTO_ITEM");
      registro(anuncio.titulo).within(() => {
        cy.contains("CANCELAMENTO DE ITEM");
        cy.contains("Cancelado para o teste de auditoria.");
      });

      // Filtro de alvo que não combina com a ação: o registro some.
      cy.get("#filtros-auditoria-tipo_alvo").select("USUARIO");
      cy.contains("button", "Filtrar").click();
      cy.contains('[data-slot="card"]', anuncio.titulo).should("not.exist");
    });
  });

  it("ST-21 – Auditoria do bloqueio de usuário", () => {
    criarPessoa("Bloqueada").then((pessoa) => {
      comoAdmin("PUT", `admin/usuarios/${pessoa.id}/bloquear`, { justificativa: "Bloqueio para o teste de auditoria." });

      cy.visit("/admin/auditoria?tipo_acao=BLOQUEIO_USUARIO&tipo_alvo=USUARIO");
      registro(pessoa.nome).within(() => {
        cy.contains("BLOQUEIO DE USUARIO");
        cy.contains("Bloqueio para o teste de auditoria.");
      });
      cy.contains("button", /^Limpar filtros \(2\)/).click();
      cy.location("search").should("not.contain", "tipo_acao=");
    });
  });
});
