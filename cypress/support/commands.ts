/// <reference types="cypress" />
import { tokenAdmin } from "./api";

declare global {
  namespace Cypress {
    interface Chainable {
      /** Usa a sessão de um token da API (o cookie que o front lê). */
      usarSessao(token: string): Chainable<void>;
      /** Entra como o admin do seed (CYPRESS_ADMIN_EMAIL / CYPRESS_ADMIN_SENHA). */
      loginAdmin(): Chainable<void>;
      /** Espera o React assumir o elemento; no `next dev` um clique antes disso se perde. */
      hidratado(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("usarSessao", (token: string) => {
  cy.setCookie("doai_token", token, { log: false });
});

Cypress.Commands.add("loginAdmin", () => {
  tokenAdmin().then((token) => cy.usarSessao(token));
});

Cypress.Commands.add("hidratado", { prevSubject: "element" }, (elemento: JQuery<HTMLElement>) =>
  cy.wrap(elemento, { log: false }).should(($el) => {
    expect(Object.keys($el[0]).some((chave) => chave.startsWith("__reactProps"))).to.equal(true);
  }));

export {};
