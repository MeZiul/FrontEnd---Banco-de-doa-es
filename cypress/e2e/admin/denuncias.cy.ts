// [E2E][DENÚNCIAS] Testes de denúncias ST-01 a ST-05: registro, análise e resolução de denúncias de anúncios e usuários.

import { criarAnuncio, criarDenuncia, criarPessoa, type Anuncio, type Pessoa } from "../../support/api";

describe("Suite Denúncias – ST-01 a ST-05", () => {
  let doador: Pessoa;
  let denunciante: Pessoa;
  let anuncio: Anuncio;

  beforeEach(() => {
    criarPessoa("Doador").then((p) => { doador = p; });
    criarPessoa("Denunciante").then((p) => { denunciante = p; });
    cy.then(() => criarAnuncio(doador)).then((a) => { anuncio = a; });
  });

  function abrirAnalise(textoDoCard: string) {
    cy.contains("article", textoDoCard, { timeout: 15000 }).as("card")
      .contains("button", "Analisar denúncia").hidratado().click();
    cy.get("@card").contains("h3", "Resolver denúncia").should("be.visible");
  }

  function resolver(resultado: "PROCEDENTE" | "IMPROCEDENTE", resposta: string) {
    cy.get("@card").find('select[id^="resultado-"]').select(resultado);
    cy.get("@card").find('textarea[id^="resposta-"]').type(resposta);
    cy.get("@card").contains("button", "Confirmar resolução").click();
  }

  it("ST-01 – Denúncia registrada pelo usuário e visível ao admin", () => {
    cy.usarSessao(denunciante.token);
    cy.visit(`/doacoes/${anuncio._id}`);
    cy.contains("summary", "Denunciar item ou doador").click();
    cy.get('select[name="tipo_alvo"]').select("ITEM");
    cy.get('select[name="motivo"]').select("FRAUDE");
    cy.get('textarea[name="descricao"]').type("Anúncio pede pagamento antecipado.");
    cy.contains("button", "Enviar denúncia").click();
    cy.contains('[role="status"]', "Denúncia registrada para análise da administração.").should("be.visible");

    cy.loginAdmin();
    cy.visit("/admin/denuncias?status=EM_ANALISE&tipo_alvo=ITEM&motivo=FRAUDE");
    cy.contains("article", anuncio.titulo, { timeout: 15000 }).within(() => {
      cy.contains("Em análise");
      cy.contains(denunciante.nome);
      cy.contains("Anúncio pede pagamento antecipado.");
    });
  });

  it("ST-02 – Resolução de denúncia sem resposta administrativa", () => {
    criarDenuncia(denunciante, { tipo_alvo: "ITEM", alvo_item_id: anuncio._id });
    cy.loginAdmin();
    cy.visit("/admin/denuncias?status=EM_ANALISE&tipo_alvo=ITEM&motivo=SPAM");
    abrirAnalise(anuncio.titulo);

    cy.get("@card").contains("button", "Confirmar resolução").should("be.disabled");
    cy.get("@card").find('textarea[id^="resposta-"]').type("   ");
    cy.get("@card").contains("button", "Confirmar resolução").should("be.disabled");
    cy.get("@card").contains("button", "Cancelar").click();
    cy.get("@card").contains("Resolver denúncia").should("not.exist");
    cy.get("@card").contains("Em análise");

    // Critério: nada foi enviado à API, então depois de recarregar a denúncia continua em análise.
    cy.reload();
    cy.contains("article", anuncio.titulo, { timeout: 15000 }).within(() => {
      cy.contains("Em análise");
      cy.contains("button", "Analisar denúncia");
    });
  });

  it("ST-03 – Denúncia procedente contra anúncio", () => {
    criarDenuncia(denunciante, { tipo_alvo: "ITEM", alvo_item_id: anuncio._id });
    cy.loginAdmin();
    cy.visit("/admin/denuncias?tipo_alvo=ITEM&motivo=SPAM");
    abrirAnalise(anuncio.titulo);
    resolver("PROCEDENTE", "Anúncio fora das regras da plataforma.");

    cy.get("@card").within(() => {
      cy.contains("Procedente");
      cy.contains("Anúncio fora das regras da plataforma.");
      cy.contains("button", "Analisar denúncia").should("not.exist");
    });

    cy.visit(`/admin/itens?busca=${encodeURIComponent(anuncio.titulo)}`);
    cy.contains("li", anuncio.titulo).contains("Cancelado");

    cy.usarSessao(denunciante.token);
    cy.visit("/perfil/notificacoes");
    cy.contains("Denúncia analisada");
    cy.contains("considerada PROCEDENTE");
  });

  it("ST-04 – Denúncia improcedente", () => {
    criarDenuncia(denunciante, { tipo_alvo: "ITEM", alvo_item_id: anuncio._id }, "OUTRO");
    cy.loginAdmin();
    cy.visit("/admin/denuncias?tipo_alvo=ITEM&motivo=OUTRO");
    abrirAnalise(anuncio.titulo);
    resolver("IMPROCEDENTE", "Anúncio dentro das regras.");

    cy.get("@card").contains("Improcedente");
    cy.get("@card").contains("button", "Analisar denúncia").should("not.exist");

    cy.visit(`/admin/itens?busca=${encodeURIComponent(anuncio.titulo)}`);
    cy.contains("li", anuncio.titulo).contains("Disponível");
  });

  it("ST-05 – Denúncia procedente contra usuário", () => {
    criarDenuncia(denunciante, { tipo_alvo: "USUARIO", alvo_usuario_id: doador.id }, "ASSEDIO");
    cy.loginAdmin();
    cy.visit("/admin/denuncias?tipo_alvo=USUARIO&motivo=ASSEDIO");
    abrirAnalise(doador.nome);
    resolver("PROCEDENTE", "Mensagens ofensivas comprovadas.");
    cy.get("@card").contains("Procedente");

    cy.visit(`/admin/usuarios?email=${encodeURIComponent(doador.email)}`);
    cy.contains("h2", doador.nome, { timeout: 15000 }).parents(".rounded-2xl").first().contains("SUSPENSO");
  });
});
