const API_FIXTURE = "http://127.0.0.1:19051";

describe("Minhas Avaliações", () => {
  beforeEach(() => {
    cy.request("POST", `${API_FIXTURE}/__test/reset`);
    cy.setCookie("doai_token", "usuario-fixture");
  });

  it("permite editar avaliação antiga e atualiza o conteúdo exibido", () => {
    cy.visit("/perfil/minhas-avaliacoes");
    cy.contains("Doação recebida").should("be.visible");
    cy.contains("a", "Próxima página").click();
    cy.contains("Doação antiga").should("be.visible");

    cy.contains("button", "Editar").click();
    cy.get("textarea").clear().type("Comentário atualizado no navegador");
    cy.get('button[aria-label="Nota 5"]').click();
    cy.contains("button", "Salvar").click();
    cy.contains("Comentário atualizado no navegador").should("be.visible");

    cy.request(`${API_FIXTURE}/__test/state`).then(({ body }) => {
      const alterada = body.data.avaliacoes.find((item: { _id: string }) => item._id === "avaliacao-antiga");
      expect(alterada.nota).to.equal(5);
      expect(alterada.comentario).to.equal("Comentário atualizado no navegador");
      expect(body.data.requests.some((item: { method: string; path: string }) => item.method === "PUT" && item.path.endsWith("avaliacao-antiga"))).to.equal(true);
    });
  });

  it("does not send DELETE when the person cancels confirmation", () => {
    cy.visit("/perfil/minhas-avaliacoes?page=2");
    cy.on("window:confirm", (message) => {
      expect(message).to.include("não pode ser desfeita");
      return false;
    });
    cy.contains("button", "Remover").click();

    cy.request(`${API_FIXTURE}/__test/state`).then(({ body }) => {
      expect(body.data.ids).to.include("avaliacao-antiga");
      expect(body.data.requests.some((item: { method: string }) => item.method === "DELETE")).to.equal(false);
    });
  });

  it("confirma remoção, chama a API e retira o cartão", () => {
    cy.visit("/perfil/minhas-avaliacoes?page=2");
    cy.on("window:confirm", () => true);
    cy.contains("button", "Remover").click();
    cy.contains("Doação antiga").should("not.exist");

    cy.request(`${API_FIXTURE}/__test/state`).then(({ body }) => {
      expect(body.data.ids).not.to.include("avaliacao-antiga");
      expect(body.data.requests.some((item: { method: string; path: string }) => item.method === "DELETE" && item.path.endsWith("avaliacao-antiga"))).to.equal(true);
    });
  });

  it("admin vê apenas avaliações próprias e recebidas e pagina cada grupo separadamente", () => {
    cy.setCookie("doai_token", "admin-fixture");
    cy.viewport(390, 844);
    cy.visit("/perfil/minhas-avaliacoes");

    cy.contains("h2", "Feitas por mim").should("be.visible");
    cy.contains("h2", "Recebidas por mim").should("be.visible");
    cy.contains("Doação do admin").should("be.visible");
    cy.contains("Doação recebida pelo admin").should("be.visible");
    cy.contains("Registro de terceiros").should("not.exist");

    cy.get('section[aria-labelledby="avaliacoes-feitas"]').contains("a", "Próxima página").click();
    cy.url().should("include", "feitas=2&recebidas=1");
    cy.contains("Outra doação do admin").should("be.visible");
    cy.contains("Doação recebida pelo admin").should("be.visible");

    cy.get('section[aria-labelledby="avaliacoes-recebidas"]').contains("a", "Próxima página").click();
    cy.url().should("include", "feitas=2&recebidas=2");
    cy.contains("Outra doação recebida").should("be.visible");
    cy.contains("Outra doação do admin").should("be.visible");
  });
});
