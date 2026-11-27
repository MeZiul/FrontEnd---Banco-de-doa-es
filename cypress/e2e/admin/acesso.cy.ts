// [E2E] [ACESSO] Testes de acesso ao painel administrativo ST-22 a ST-24: visitante, usuário comum e admin.

import { criarPessoa } from "../../support/api";

const TELAS_ADMIN = [
  ["Dashboard", "/admin/dashboard"],
  ["Usuários", "/admin/usuarios"],
  ["Anúncios", "/admin/itens"],
  ["Denúncias", "/admin/denuncias"],
  ["Categorias", "/admin/categorias"],
  ["Auditoria", "/admin/auditoria"],
] as const;

// Quem pode abrir o painel administrativo.
describe("Suite Acesso ao painel – ST-22 a ST-24", () => {
  it("ST-22 – Visitante tenta abrir o painel", () => {
    cy.visit("/admin/usuarios?situacao=ATIVO");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", `redirect=${encodeURIComponent("/admin/usuarios?situacao=ATIVO")}`);
  });

  it("ST-23 – Usuário comum tenta abrir o painel", () => {
    criarPessoa("Comum").then((pessoa) => cy.usarSessao(pessoa.token));
    for (const [, caminho] of TELAS_ADMIN) {
      cy.visit(caminho);
      cy.location("pathname").should("eq", "/");
    }
  });

  it("ST-24 – Navegação do admin pelo menu lateral", () => {
    cy.loginAdmin();
    cy.visit("/admin/dashboard");
    for (const [rotulo, caminho] of TELAS_ADMIN) {
      cy.contains("a", rotulo).click();
      cy.location("pathname", { timeout: 15000 }).should("eq", caminho);
    }
  });
});
