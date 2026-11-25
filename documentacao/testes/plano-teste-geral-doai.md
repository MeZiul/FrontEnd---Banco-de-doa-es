# Plano de Teste

**Projeto Doaí – Painel Administrativo (Next.js + API Express/Prisma)**  
*versão 1.1*

## Histórico das alterações

| Data       | Versão | Descrição                                                                                              | Autor(a)        |
|------------|--------|--------------------------------------------------------------------------------------------------------|-----------------|
| 25/11/2026 | 1.0    | Primeira versão do Plano de Testes E2E do painel administrativo, com 6 arquivos Cypress novos (`cypress/e2e/admin/`) | José Martines   |
| 25/11/2026 | 1.1    | Títulos dos testes Cypress alinhados aos IDs da suíte (`describe` "Suite …" e `it` "ST-xx – …") | José Martines   |

---

## 1 - Introdução

O Doaí é uma plataforma de doação de itens. Quem doa publica anúncios, quem precisa manifesta interesse, e as duas partes se avaliam ao final. O **painel administrativo** (`/admin`) é a área de moderação. Nele o administrador:

- acompanha as **métricas** da plataforma;
- analisa **denúncias** contra anúncios e usuários;
- age sobre **contas**: suspender, reativar, inativar, promover e rebaixar;
- gerencia **categorias**;
- modera **anúncios**;
- consulta a **trilha de auditoria** das ações.

Este plano descreve os cenários e os critérios de aceitação dos fluxos de moderação. O objetivo é garantir que as regras de negócio da API são respeitadas, que a tela reflete o resultado de cada ação e que só administradores acessam o painel.

---

## 2 - Arquitetura

- **Front-end:** Next.js 16 (App Router) e React 19.
  - Server Components e Server Actions.
  - TanStack Query nas listas que carregam no navegador.
  - `nuqs` para filtros e paginação na URL.
- **Camadas/organização do front:**
  - `app/(protected)/admin/` – telas e Server Actions do painel: `dashboard`, `denuncias`, `usuarios`, `categorias`, `itens`, `auditoria`.
  - `components/admin/` – cards e formulários: denúncia, usuário, categoria, anúncio, auditoria e menu lateral.
  - `components/shared/barra-filtros.tsx` – barra de filtros que grava os valores na URL.
  - `lib/admin-filtros.ts` – campos de filtro de cada lista e validação dos filtros vindos do navegador.
  - `proxy.ts` – manda para o login quem acessa `/admin`, `/perfil` ou `/itens-doacao` sem sessão.
- **API:** Express 5, Prisma (PostgreSQL) e Better Auth (sessão por token, cookie `doai_token` no front).
- **Testes já existentes:**
  - unitários do front com `node --test` (`tests/*.test.mjs`);
  - unitários e de rota da API com Jest;
  - E2E de login, cadastro, dashboard e minhas avaliações.

### Principais endpoints (usados nos testes)
- `POST /api/auth/sign-in/email` → devolve `{ token }`.
- `POST /usuario` → cadastra uma conta.
- `POST /itemdoacao` → cria um anúncio.
- `POST /denuncias` → cria uma denúncia.
- `GET /admin/denuncias` e `PUT /admin/denuncias/:id/resolver` → listam e resolvem denúncias.
- `GET /admin/usuarios`, `PUT /admin/usuarios/:id/bloquear|desbloquear|inativar` e `PATCH /admin/usuarios/:id/perfil` → listam e alteram contas.
- `GET /admin/categorias`, `POST /categorias`, `PUT /categorias/:id` e `DELETE /categorias/:id` → gestão de categorias.
- `GET /admin/itens` e `PUT /admin/itens/:id/cancelar` → listam e cancelam anúncios.
- `GET /admin/administracoes` → trilha de auditoria.

> **Nota de porta:** o front roda em `http://localhost:5173` e a API em `http://127.0.0.1:7340`.

---

## 3 - Requisitos

### Funcionais

| Código | Requisito Funcional | Regra de Negócio Associada |
|--------|---------------------|----------------------------|
| RF001 | Usuário **denuncia** um anúncio ou o doador pela página da doação. | Alvo (anúncio ou doador) e motivo são obrigatórios; a descrição é opcional. A denúncia nasce **Em análise**. |
| RF002 | Admin **lista denúncias** com filtros. | Filtros por status, alvo e motivo. As mais recentes aparecem primeiro. |
| RF003 | Admin **resolve denúncia**. | Só denúncias em análise. Resultado Procedente ou Improcedente, com resposta obrigatória. **Procedente contra anúncio** cancela o anúncio. **Procedente contra usuário** suspende a conta. O denunciante é notificado. |
| RF004 | Admin **lista usuários** com filtros. | Nome e e-mail por busca parcial; situação (Ativo/Suspenso/Inativo); perfil (Usuário/Administrador). |
| RF005 | Admin **suspende, reativa e inativa** contas. | A suspensão exige justificativa; a data final é opcional e precisa ser futura. Reativar e inativar pedem confirmação. |
| RF006 | Admin **promove ou rebaixa** uma conta. | Pede confirmação; as sessões da conta são revogadas. O admin **não** pode alterar o próprio perfil. |
| RF007 | Admin **gerencia categorias**. | Nome obrigatório (2 a 60 caracteres) e único. A categoria inativa não aparece para quem anuncia. A exclusão pede confirmação. |
| RF008 | Admin **modera anúncios**. | Busca e filtro por situação ("Todas" inclui os cancelados). O cancelamento exige motivo de no mínimo 10 caracteres e o doador recebe o motivo. Anúncios doados ou cancelados não podem ser cancelados. |
| RF009 | **Trilha de auditoria** das ações de moderação. | Toda ação registra o administrador, o alvo e a justificativa. Filtros por tipo de ação e tipo de alvo. |
| RF010 | **Controle de acesso** ao painel. | Visitante vai para `/login?redirect=<tela pedida>`. Usuário comum vai para `/`. |
| RF011 | **Dashboard** com métricas ao vivo. | 6 indicadores, atualizados automaticamente ("Ao vivo"). |

### Não Funcionais

| Código | Requisito Não Funcional |
|--------|-------------------------|
| RNF001 | Mensagens em pt-BR, claras e sem termos técnicos. |
| RNF002 | Limite de requisições na API: 10 logins a cada 15 min e 300 requisições a cada 15 min por IP. Pode ser desligado **só fora de produção**, com `RATE_LIMIT_E2E_DESATIVADO=true`. |
| RNF003 | Os argumentos das Server Actions vêm do navegador e são validados no servidor: filtros desconhecidos são descartados. |
| RNF004 | Acessibilidade: campos com `label`, retorno com `role="status"` / `role="alert"`, filtros em `role="search"`. |
| RNF005 | Filtros e paginação na URL, para poder compartilhar e recarregar a tela. |
| RNF006 | Compatível com navegadores modernos (Chrome, Edge, Firefox). |
| RNF007 | Ações destrutivas (reativar, inativar, mudar perfil, excluir) pedem confirmação. |

---

## 4 - Casos de Teste

### Denúncias
- CT001 – Usuário registra a denúncia pela página do anúncio e o admin a vê em análise. *(ST-01)*
- CT002 – A resolução sem resposta administrativa fica bloqueada. *(ST-02)*
- CT003 – Procedente contra anúncio cancela o anúncio e notifica o denunciante. *(ST-03)*
- CT004 – Improcedente mantém o anúncio disponível. *(ST-04)*
- CT005 – Procedente contra usuário suspende a conta. *(ST-05)*

### Usuários
- CT010 – Filtros por nome, e-mail parcial, situação e perfil, e "Limpar filtros". *(ST-06)*
- CT011 – Suspensão com justificativa; a conta suspensa não entra. *(ST-07)*
- CT012 – A reativação respeita o cancelamento da confirmação. *(ST-08)*
- CT013 – Inativação esconde as ações de situação. *(ST-09)*
- CT014 – Promover a administrador e voltar a usuário. *(ST-10)*
- CT015 – O admin não altera o próprio perfil. *(ST-11)*

### Categorias
- CT020 – Criar categoria e recusar nome repetido. *(ST-12)*
- CT021 – Nome obrigatório. *(ST-13)*
- CT022 – Editar nome e ordem. *(ST-14)*
- CT023 – A categoria inativa some da nova doação. *(ST-15)*
- CT024 – A exclusão pede confirmação. *(ST-16)*

### Anúncios
- CT030 – Filtros de busca e situação. *(ST-17)*
- CT031 – Cancelamento com motivo e notificação ao doador. *(ST-18)*
- CT032 – Anúncio doado sem opção de cancelar. *(ST-19)*

### Auditoria
- CT040 – Registro do cancelamento de anúncio, com filtros. *(ST-20)*
- CT041 – Registro do bloqueio de usuário, com filtros. *(ST-21)*

### Acesso e Dashboard
- CT050 – Visitante vai para o login preservando a tela pedida. *(ST-22)*
- CT051 – Usuário comum é bloqueado em todas as telas do admin. *(ST-23)*
- CT052 – Admin navega pelas 6 telas pelo menu lateral. *(ST-24)*
- CT053 – Dashboard com 6 indicadores ao vivo. *(ST-25)*

---

## 5 - Estratégia de Teste

- **Unitários:**
  - front com `node --test`: actions, validações e filtros (`tests/*.test.mjs`);
  - API com Jest: serviços, rotas, repositórios e middlewares.

- **Integração:** testes de rota da API com Supertest e repositórios mockados.

- **E2E (implementado – Cypress):** 7 arquivos em `cypress/e2e/admin/`, contra a API real.

  | Arquivo | Cenários cobertos |
  |---------|-------------------|
  | `denuncias.cy.ts` | Denúncia pela página do anúncio, resposta obrigatória, procedente (anúncio e usuário), improcedente |
  | `usuarios.cy.ts` | Filtros, suspender, reativar, inativar, promover/rebaixar, próprio perfil |
  | `categorias.cy.ts` | Criar, nome repetido, obrigatório, editar, inativar/reativar, excluir |
  | `anuncios.cy.ts` | Busca e situação, cancelar com motivo, anúncio doado |
  | `auditoria.cy.ts` | Registro e filtros de cancelamento e bloqueio |
  | `acesso.cy.ts` | Visitante, usuário comum, navegação do admin |
  | `dashboard.cy.ts` | Indicadores ao vivo (já existia) |

  - **Massa de dados:** cada teste cria as próprias contas, anúncios e denúncias pela API (`cypress/support/api.ts`), com nomes únicos ("QA" + número). Não há dependência entre testes nem do seed, exceto o administrador.
  - **O que é testado pela tela:** a ação validada é sempre feita pela interface. A API serve só para preparar o cenário.
  - **Comandos personalizados** (`cypress/support/commands.ts`):
    - `cy.loginAdmin()`;
    - `cy.usarSessao(token)`;
    - `.hidratado()`, que espera o React assumir o elemento antes do clique no `next dev`.

- **Manuais:** testes exploratórios da API pela documentação Scalar (`/docs`) e da interface.

---

## 6 - Ambiente e Ferramentas

| Ferramenta | Fase | Descrição |
|------------|------|-----------|
| node:test + TypeScript | Desenvolvimento | Unitários do front |
| Jest + Supertest | Desenvolvimento | Unitários e rotas da API |
| Scalar (`/docs`) | Desenvolvimento | Testes manuais de endpoints |
| Cypress 16 | E2E | Fluxos ponta a ponta, **implementado** em `cypress/e2e/` |
| ESLint + TypeScript | Dev/CI | Lint e checagem de tipos, inclusive da pasta `cypress/` |

### Pré-requisitos para executar os testes E2E

| Item | Comando |
|------|---------|
| Subir a API (porta 7340), no Git Bash | `RATE_LIMIT_E2E_DESATIVADO=true APP_PORT=7340 node server.js` em `backend-api-banco-de-doacoes/` |
| Subir o front (porta 5173) sem login automático, no Git Bash | `DEV_LOGIN_EMAIL= DEV_LOGIN_SENHA= node node_modules/next/dist/bin/next dev --port 5173` |
| Informar o admin do seed, no PowerShell | `$env:CYPRESS_ADMIN_EMAIL="..."; $env:CYPRESS_ADMIN_SENHA="..."` |
| Rodar com interface | `node node_modules/cypress/bin/cypress open` |
| Rodar headless (só o admin) | `node node_modules/cypress/bin/cypress run --spec "cypress/e2e/admin/**/*.cy.ts"` |

> No Git Bash, o `npx cypress` encerra com "Illegal instruction".

---

## 7 - Classificação de Bugs

| ID | Severidade | Descrição |
|----|------------|-----------|
| 1 | **Blocker** | Impede o uso da moderação: tela do admin não abre, ação essencial inoperante. |
| 2 | **Grave** | Erro lógico sério: ação aplicada ao alvo errado, registro não aparece, acesso indevido ao painel. |
| 3 | **Moderada** | Critério não atendido, mas há alternativa (ex.: filtro sem efeito, mensagem ausente). |
| 4 | **Pequena** | Impacto mínimo na experiência (textos, rótulos em código, espaçamentos). |

---

## 8 - Definição de Pronto

Será considerada pronta a funcionalidade que:
- passar em todos os casos de teste aplicáveis;
- não apresentar bugs **Blocker** ou **Grave**;
- tiver a UI revisada em pt-BR e acessibilidade mínima (labels e mensagens com `role`);
- tiver a documentação atualizada (este plano e a documentação da API);
- tiver a validação da equipe técnica e do QA concluída.

---

### Usuários de teste

| Perfil | Origem |
|--------|--------|
| Administrador | Conta do seed local. As credenciais vêm de `CYPRESS_ADMIN_EMAIL` e `CYPRESS_ADMIN_SENHA` e não são gravadas no código |
| Doador, denunciante, recebedor etc. | Contas sintéticas criadas a cada teste: e-mail `qa.<número>@example.test`, senha `Senha@123` e CPF válido gerado |
