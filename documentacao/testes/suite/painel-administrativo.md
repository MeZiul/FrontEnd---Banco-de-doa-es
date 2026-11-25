# Suite de Testes – Fluxo "Moderação no Painel Administrativo"
**Projeto:** Doaí (Next.js + API Express/Prisma)  
**Sprint:** Moderação – denúncias, usuários, categorias e anúncios  
**Versão:** 1.1

---

## Histórico

| Data       | Versão | Descrição                                                                 | Autor         |
|------------|--------|---------------------------------------------------------------------------|---------------|
| 25/11/2026 | 1.0    | Criação da suíte e automação Cypress dos 25 cenários (ST-01 a ST-25)       | José Martines |
| 25/11/2026 | 1.1    | Testes Cypress renomeados com os IDs ST; ST-02 ganha a verificação após recarregar; ST-08 confere o `confirm` nos dois cliques | José Martines |

---

## Pré-condições gerais

| Item | Valor |
|------|-------|
| Front rodando em | `http://localhost:5173`, **sem** login automático (`DEV_LOGIN_EMAIL=` e `DEV_LOGIN_SENHA=` vazios) |
| API rodando em | `http://127.0.0.1:7340`, com `RATE_LIMIT_E2E_DESATIVADO=true` |
| Administrador | Admin do seed, em `CYPRESS_ADMIN_EMAIL` / `CYPRESS_ADMIN_SENHA` |
| Demais contas | Criadas por cada teste pela API (`criarPessoa`, em `cypress/support/api.ts`) |
| Cookies | Limpos pelo Cypress antes de cada teste; a sessão é definida no cookie `doai_token` |

> **Atenção:** sem `RATE_LIMIT_E2E_DESATIVADO=true`, a API recusa o 11º login em 15 minutos (`429 Too Many Requests`), e a suíte para no meio. A chave não tem efeito com `NODE_ENV=production`.

---