// [E2E][ANÚNCIOS] Testes de anúncios ST-17 a ST-19: filtros da lista, cancelamento e restrição de cancelamento de anúncios doados.

import { api, comoAdmin, criarAnuncio, criarPessoa, unico, type Anuncio, type Pessoa } from "../../support/api";

// Moderação de anúncios (F5) com os filtros da lista (F8).
describe("Suite Anúncios – ST-17 a ST-19", () => {
  let doador: Pessoa;

  beforeEach(() => {
    criarPessoa("Doador").then((p) => { doador = p; });
    cy.loginAdmin();
  });

  const card = (titulo: string) => cy.contains("li h2", titulo, { timeout: 15000 }).closest("li").as("card");

  it("ST-17 – Filtros da lista de anúncios", () => {
    const marca = `Lote QA ${unico()}`;
    let cancelado: Anuncio;
    cy.then(() => criarAnuncio(doador, `${marca} mesa`));
    cy.then(() => criarAnuncio(doador, `${marca} cadeira`)).then((a) => { cancelado = a; });
    cy.then(() => comoAdmin("PUT", `admin/itens/${cancelado._id}/cancelar`, { motivo: "Preparação do teste de filtros." }));

    cy.visit("/admin/itens");
    cy.get("#filtros-itens-busca").hidratado().type(marca);
    cy.contains("button", "Filtrar").click();
    cy.contains("2 anúncio(s) encontrado(s)", { timeout: 15000 });
    cy.location("search").should("contain", "busca=");

    cy.get("#filtros-itens-status").select("CANCELADO");
    cy.contains("button", "Filtrar").click();
    cy.contains("1 anúncio(s) encontrado(s)", { timeout: 15000 });
    card(`${marca} cadeira`).contains("Cancelado");
    cy.contains("li h2", `${marca} mesa`).should("not.exist");

    cy.contains("button", /^Limpar filtros/).click();
    cy.location("search").should("not.contain", "busca=");
  });

  it("ST-18 – Cancelar anúncio com motivo", () => {
    criarAnuncio(doador).then((anuncio) => {
      cy.visit(`/admin/itens?busca=${encodeURIComponent(anuncio.titulo)}`);
      card(anuncio.titulo).contains("button", "Cancelar anúncio").hidratado().click();

      // Motivo curto: a action recusa e o anúncio continua disponível.
      cy.get("@card").find("textarea").type("curto");
      cy.get("@card").contains("button", "Confirmar cancelamento").click();
      cy.get("@card").find('[role="alert"]').should("be.visible");
      cy.get("@card").contains("Disponível");

      cy.get("@card").find("textarea").clear().type("Item proibido pelas regras da plataforma.");
      cy.get("@card").contains("button", "Confirmar cancelamento").click();
      cy.get("@card").find('[role="status"]').should("contain", "Anúncio cancelado.");
      card(anuncio.titulo).within(() => {
        cy.contains("Cancelado");
        cy.contains("Item proibido pelas regras da plataforma.");
        cy.contains("button", "Cancelar anúncio").should("not.exist");
      });

      cy.usarSessao(doador.token);
      cy.visit("/perfil/notificacoes");
      cy.contains("Anúncio cancelado pela moderação");
      cy.contains("Item proibido pelas regras da plataforma.");
    });
  });

  it("ST-19 – Anúncio doado não pode ser cancelado", () => {
    criarPessoa("Recebedor").then((recebedor) => {
      criarAnuncio(doador).then((anuncio) => {
        // Doação completa pela API: interesse, aceite, entrega e recebimento.
        api<{ _id: string }>(recebedor.token, "POST", "interesses", { item_id: anuncio._id, mensagem: "Tenho interesse." })
          .then((interesse) => api(doador.token, "PUT", `interesses/${interesse._id}/aceitar`, {}));
        api(doador.token, "PUT", `itemdoacao/${anuncio._id}/confirmar-entrega`, {});
        api(recebedor.token, "PUT", `itemdoacao/${anuncio._id}/confirmar-recebimento`, {});

        cy.visit(`/admin/itens?busca=${encodeURIComponent(anuncio.titulo)}`);
        card(anuncio.titulo).contains("Doado");
        cy.get("@card").contains("button", "Cancelar anúncio").should("not.exist");
      });
    });
  });
});
