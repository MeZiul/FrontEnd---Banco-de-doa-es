import "./commands";

// shortcut: no `next dev`, o rastreio de desempenho do React lança este erro quando um layout do servidor
// redireciona (ex.: AdminLayout mandando quem não é admin para "/"). Só acontece em modo de desenvolvimento;
// ignorar apenas esta mensagem. Remover se os testes passarem a rodar contra `next build && next start`.
Cypress.on("uncaught:exception", (erro) => {
  if (/cannot have a negative time stamp/.test(erro.message)) return false;
});
