// [E2E][USUÁRIOS] Testes de usuários ST-06 a ST-11: filtros, suspensão, reativação, inativação e promoção a administrador.

import { comoAdmin, criarPessoa, entrarNaApi, type Pessoa } from "../../support/api";

// Ações do admin sobre contas, sempre em contas sintéticas criadas pelo próprio teste.
describe("Suite Usuários – ST-06 a ST-11", () => {
  let pessoa: Pessoa;

  beforeEach(() => {
    criarPessoa("Moderada").then((p) => { pessoa = p; });
    cy.loginAdmin();
  });

  /** Abre a lista já filtrada pelo e-mail da pessoa e devolve o card dela. */
  function abrirCard(email = pessoa.email) {
    cy.visit(`/admin/usuarios?email=${encodeURIComponent(email)}`);
    return cy.contains("h2", email === pessoa.email ? pessoa.nome : /./, { timeout: 15000 })
      .closest(".shadow-sm").as("card");
  }

  function clicar(texto: string) {
    cy.get("@card").contains("button", texto).hidratado().click();
  }

  it("ST-06 – Filtros da lista de usuários", () => {
    cy.visit("/admin/usuarios");
    cy.get("#filtros-usuarios-nome").hidratado().type(pessoa.nome);
    cy.get("#filtros-usuarios-email").type(pessoa.email.slice(0, 20));
    cy.get("#filtros-usuarios-situacao").select("ATIVO");
    cy.get("#filtros-usuarios-perfil").select("USUARIO");
    cy.contains("button", "Filtrar").click();

    cy.location("search").should("contain", "situacao=ATIVO").and("contain", "perfil=USUARIO");
    cy.contains("h2", pessoa.nome, { timeout: 15000 }).should("be.visible");
    cy.get("h2").should("have.length", 1);

    // Pessoa recém-criada não é administradora: o filtro de perfil a exclui.
    cy.get("#filtros-usuarios-perfil").select("ADMINISTRADOR");
    cy.contains("button", "Filtrar").click();
    cy.contains("Nenhum usuário encontrado.");

    cy.contains("button", /^Limpar filtros/).click();
    cy.location("search").should("not.contain", "email=");
    cy.get("#filtros-usuarios-nome").should("have.value", "");
  });

  it("ST-07 – Suspensão de usuário", () => {
    abrirCard();
    clicar("Suspender");
    cy.get("@card").contains("button", "Confirmar suspensão").should("be.disabled");
    cy.get("@card").find("textarea").type("Golpe relatado por outros usuários.");
    cy.get("@card").find('input[type="date"]').should("have.attr", "min");
    cy.get("@card").contains("button", "Confirmar suspensão").click();
    cy.get("@card").contains("SUSPENSO", { timeout: 15000 });
    cy.get("@card").contains("button", "Reativar");

    cy.clearCookies();
    cy.visit("/login");
    cy.get('[data-test="credencialLogin"]').hidratado().type(pessoa.email);
    cy.get('[data-test="senhaLogin"]').type(pessoa.senha, { log: false });
    cy.get('[data-test="buttonEntrar"]').click();
    cy.get('[data-test="mensagemErroLogin"]', { timeout: 15000 }).should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("ST-08 – Reativação de usuário", () => {
    comoAdmin("PUT", `admin/usuarios/${pessoa.id}/bloquear`, { justificativa: "Preparação do teste de reativação." });
    abrirCard();
    cy.get("@card").contains("SUSPENSO");

    // Primeiro a pessoa desiste no confirm; depois confirma.
    const confirmar = cy.stub().as("confirm");
    confirmar.onFirstCall().returns(false).onSecondCall().returns(true);
    cy.on("window:confirm", confirmar);

    clicar("Reativar");
    cy.get("@confirm").should("have.been.calledOnce");
    cy.get("@card").contains("SUSPENSO");

    clicar("Reativar");
    cy.get("@confirm").should("have.been.calledTwice");
    cy.get("@card").contains("ATIVO", { timeout: 15000 });
    cy.get("@card").contains("button", "Suspender");
  });

  it("ST-09 – Inativação de usuário", () => {
    abrirCard();
    cy.on("window:confirm", () => true);
    clicar("Inativar");
    cy.get("@card").contains("INATIVO", { timeout: 15000 });
    cy.get("@card").contains("button", "Suspender").should("not.exist");
    cy.get("@card").contains("button", "Inativar").should("not.exist");
  });

  it("ST-10 – Promover a administrador e voltar a usuário", () => {
    abrirCard();
    cy.on("window:confirm", () => true);
    clicar("Tornar administrador");
    cy.get("@card").contains("Administrador", { timeout: 15000 });

    // A promoção derruba as sessões antigas: entra de novo e já acessa o painel.
    entrarNaApi(pessoa.email, pessoa.senha).then((token) => {
      cy.usarSessao(token);
      cy.visit("/admin/dashboard");
      cy.location("pathname").should("eq", "/admin/dashboard");
    });

    cy.loginAdmin();
    abrirCard();
    clicar("Voltar a usuário");
    cy.get("@card").contains("· Usuário", { timeout: 15000 });

    entrarNaApi(pessoa.email, pessoa.senha).then((token) => {
      cy.usarSessao(token);
      cy.visit("/admin/dashboard");
      cy.location("pathname").should("eq", "/");
    });
  });

  it("ST-11 – Admin tenta alterar o próprio perfil", () => {
    cy.env<{ ADMIN_EMAIL: string }>(["ADMIN_EMAIL"], { log: false }).then(({ ADMIN_EMAIL }) => {
      abrirCard(ADMIN_EMAIL);
    });
    cy.on("window:confirm", () => true);
    clicar("Voltar a usuário");
    cy.get("@card").contains("Não é permitido alterar o próprio perfil de acesso por esta rota.", { timeout: 15000 });
    cy.get("@card").contains("Administrador");
  });
});
