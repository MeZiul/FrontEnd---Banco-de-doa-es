// Massa de dados pela API local. Cada teste cria o que usa, com nomes únicos, sem depender do seed (só do admin).
import { API_LOCAL, criarContaSintetica } from "./conta-sintetica";

export type Pessoa = ReturnType<typeof criarContaSintetica> & { id: string; token: string };
export type Anuncio = { _id: string; titulo: string; status: string };

/** Sufixo único por chamada, para achar o registro do teste nas listas. */
export const unico = () => `${Date.now()}${Cypress._.random(100, 999)}`;

export function entrarNaApi(email: string, senha: string): Cypress.Chainable<string> {
  return cy.request({
    method: "POST",
    url: `${API_LOCAL}/api/auth/sign-in/email`,
    headers: { origin: Cypress.config("baseUrl") },
    body: { email, password: senha },
    log: false,
  }).its("body.token", { log: false });
}

/** Admin do seed local: CYPRESS_ADMIN_EMAIL/CYPRESS_ADMIN_SENHA ou ADMIN_EMAIL/ADMIN_SENHA no cypress.env.json. */
export function tokenAdmin(): Cypress.Chainable<string> {
  return cy.env<{ ADMIN_EMAIL?: string; ADMIN_SENHA?: string }>(["ADMIN_EMAIL", "ADMIN_SENHA"], { log: false })
    .then(({ ADMIN_EMAIL, ADMIN_SENHA }) => {
      if (!ADMIN_EMAIL || !ADMIN_SENHA) {
        throw new Error(
          "Credenciais do admin não configuradas. Crie cypress.env.json (veja cypress.env.example.json) "
          + "ou defina CYPRESS_ADMIN_EMAIL e CYPRESS_ADMIN_SENHA antes de abrir o Cypress.",
        );
      }
      return entrarNaApi(ADMIN_EMAIL, ADMIN_SENHA);
    });
}

/** Cria uma conta sintética ativa e já devolve o token dela. */
export function criarPessoa(papel: string): Cypress.Chainable<Pessoa> {
  const conta = { ...criarContaSintetica(), nome: `${papel} QA ${unico()}` };
  return cy.request({ method: "POST", url: `${API_LOCAL}/usuario`, body: conta, log: false })
    .then(({ body }) => entrarNaApi(conta.email, conta.senha)
      .then((token) => ({ ...conta, id: body.data._id as string, token })));
}

/** Chamada autenticada à API local; devolve o `data` da resposta. */
export function api<T>(token: string, method: string, rota: string, body?: object): Cypress.Chainable<T> {
  return cy.request({
    method,
    url: `${API_LOCAL}/${rota}`,
    headers: { authorization: `Bearer ${token}` },
    body,
    log: false,
  }).its("body.data", { log: false });
}

export function criarAnuncio(dono: Pessoa, titulo = `Anúncio QA ${unico()}`): Cypress.Chainable<Anuncio> {
  return cy.request(`${API_LOCAL}/categorias`).its("body.data.docs.0._id").then((categoria) =>
    api<Anuncio>(dono.token, "POST", "itemdoacao", {
      titulo,
      descricao: "Anúncio criado pelo teste Cypress do admin.",
      categoria_id: categoria,
      condicao_item: "USADO_BOM",
    }));
}

type AlvoDenuncia = { tipo_alvo: "ITEM"; alvo_item_id: string } | { tipo_alvo: "USUARIO"; alvo_usuario_id: string };

export function criarDenuncia(denunciante: Pessoa, alvo: AlvoDenuncia, motivo = "SPAM"): Cypress.Chainable<{ _id: string }> {
  return api(denunciante.token, "POST", "denuncias", { ...alvo, motivo, descricao: "Denúncia criada pelo teste Cypress." });
}

/** Ações de admin pela API, para preparar o cenário (o que se testa continua sendo feito pela tela). */
export function comoAdmin<T>(method: string, rota: string, body?: object): Cypress.Chainable<T> {
  return tokenAdmin().then((token) => api<T>(token, method, rota, body));
}
