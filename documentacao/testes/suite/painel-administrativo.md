# Suite de Testes – Fluxo "Moderação no Painel Administrativo"
**Projeto:** Doaí (Next.js + API Express/Prisma)  
**Sprint:** Moderação – denúncias, usuários, categorias e anúncios  
**Versão:** 1.1

---

## Histórico

| Data       | Versão | Descrição                                                                 | Autor         |
|------------|--------|---------------------------------------------------------------------------|---------------|
| 25/11/2026 | 1.0    | Criação da suíte e automação Cypress dos 25 cenários (ST-01 a ST-25)       | José Martines |

---


## Pré-condições gerais

| Item | Valor |
|------|-------|
| Front rodando em | `http://localhost:5173` (`npm run dev`) |
| API rodando em | `http://127.0.0.1:7340` |
| Banco | Banco local de desenvolvimento, com o seed aplicado |
| Administrador | Conta administradora do seed |
| Demais contas | Contas de teste criadas para cada cenário (doador, denunciante, recebedor etc.), com e-mail fictício e CPF válido |
| Sessão | Sem sessão aberta antes de cada cenário |

> **Pontos de atenção levantados na leitura do código:**
> - A API limita os logins a **10 a cada 15 minutos por IP**. A suíte faz muitos logins seguidos, então é preciso prever uma forma de rodar sem esbarrar nesse limite no ambiente local.
> - Com `DEV_LOGIN_EMAIL`/`DEV_LOGIN_SENHA` preenchidos no `.env.local`, o front entra sem login. Os cenários de acesso (ST-22) exigem o front **sem** esse login automático.

---

## Seletores de referência

| Elemento | Seletor |
|----------|---------|
| Formulário de denúncia (página da doação) | `summary` "Denunciar item ou doador"; `select[name="tipo_alvo"]`, `select[name="motivo"]`, `textarea[name="descricao"]`; botão "Enviar denúncia" |
| Retorno de sucesso / erro | `[role="status"]` / `[role="alert"]` |
| Card de denúncia | `article` que contém o título do anúncio ou o nome do usuário denunciado |
| Resolução da denúncia | botão "Analisar denúncia"; `select[id^="resultado-"]`; `textarea[id^="resposta-"]`; botão "Confirmar resolução" |
| Filtros de usuários | `#filtros-usuarios-nome`, `#filtros-usuarios-email`, `#filtros-usuarios-situacao`, `#filtros-usuarios-perfil` |
| Filtros de anúncios | `#filtros-itens-busca`, `#filtros-itens-status` |
| Filtros da auditoria | `#filtros-auditoria-tipo_acao`, `#filtros-auditoria-tipo_alvo` |
| Botões da barra de filtros | "Filtrar" e "Limpar filtros (n)" |
| Card de usuário | card com o nome no `h2`; botões "Suspender", "Confirmar suspensão", "Reativar", "Inativar", "Tornar administrador", "Voltar a usuário" |
| Nova categoria | `#nova-categoria-nome`, `#nova-categoria-ordem`, `#nova-categoria-descricao`; botão "Criar categoria" |
| Card de categoria | `li` com `h2` do nome; botões "Editar", "Salvar alterações", "Excluir"; `input[name="ativo"]` |
| Card de anúncio (admin) | `li` com `h2` do título; botões "Cancelar anúncio" e "Confirmar cancelamento"; `textarea` do motivo |
| Registro da auditoria | card que contém o título ou o nome do alvo |
| Login | `[data-test="credencialLogin"]`, `[data-test="senhaLogin"]`, `[data-test="buttonEntrar"]`, `[data-test="mensagemErroLogin"]` |
| Dashboard | `[data-metrica]`, `[data-test="estadoAoVivo"]` |

> **Observação:** os cards do admin não têm `data-test`. A automação deve se apoiar nos textos dos botões, nos `id` dos campos e em um texto único do registro criado pelo próprio cenário.

---

## Suite de Testes

### ST-01 – Denúncia registrada pelo usuário e visível ao admin

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-01 |
| **Funcionalidade** | Formulário de denúncia (`/doacoes/[id]`) e lista de denúncias (`/admin/denuncias`) |
| **Comportamento esperado** | O usuário denuncia o anúncio, e o admin encontra a denúncia em análise usando os filtros. |
| **Pré-condições** | Doador com um anúncio disponível; outra conta logada como denunciante. |

**Passos de verificação:**

1. Acessar `/doacoes/<id do anúncio>` logado como denunciante.
2. Abrir "Denunciar item ou doador".
3. Selecionar o alvo **Este item** e o motivo **Fraude**, e preencher a descrição.
4. Clicar em **"Enviar denúncia"**.
5. Entrar como admin e acessar `/admin/denuncias?status=EM_ANALISE&tipo_alvo=ITEM&motivo=FRAUDE`.

**Critérios de aceite:**
- `[role="status"]` exibe `"Denúncia registrada para análise da administração."`.
- Na lista há um card com o título do anúncio, o status **"Em análise"**, o nome do denunciante e a descrição.

---

### ST-02 – Resolução de denúncia sem resposta administrativa

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-02 |
| **Funcionalidade** | Formulário "Resolver denúncia" |
| **Comportamento esperado** | Não é possível confirmar a resolução sem resposta. |
| **Pré-condições** | Denúncia em análise contra um anúncio; admin logado. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Clicar em "Analisar denúncia" no card | O formulário "Resolver denúncia" abre |
| 2 | Deixar a resposta vazia | "Confirmar resolução" fica **desabilitado** |
| 3 | Digitar só espaços na resposta | "Confirmar resolução" continua **desabilitado** |
| 4 | Clicar em "Cancelar" | O formulário fecha e a denúncia continua "Em análise" |
| 5 | Recarregar a página | A denúncia continua "Em análise", com o botão "Analisar denúncia" |

**Critérios de aceite:**
- Nenhuma resolução é enviada à API sem resposta (o passo 5 confirma, com os dados vindos do servidor).

---

### ST-03 – Denúncia procedente contra anúncio

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-03 |
| **Funcionalidade** | Resolução de denúncia com efeito no anúncio |
| **Comportamento esperado** | A procedência cancela o anúncio denunciado e avisa o denunciante. |
| **Pré-condições** | Denúncia em análise (motivo Spam) contra um anúncio disponível. |

**Passos de verificação:**

1. Acessar `/admin/denuncias?tipo_alvo=ITEM&motivo=SPAM`.
2. Abrir a análise do card do anúncio.
3. Selecionar **Procedente**, preencher a resposta e clicar em **"Confirmar resolução"**.
4. Acessar `/admin/itens?busca=<título>`.
5. Entrar como denunciante e acessar `/perfil/notificacoes`.

**Critérios de aceite:**
- O card mostra **"Procedente"** e a resposta, sem o botão "Analisar denúncia".
- O anúncio aparece com a situação **"Cancelado"**.
- O denunciante tem a notificação **"Denúncia analisada"**, com o texto "considerada PROCEDENTE".

---

### ST-04 – Denúncia improcedente

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-04 |
| **Funcionalidade** | Resolução de denúncia sem efeito no alvo |
| **Comportamento esperado** | A denúncia é encerrada e o anúncio continua disponível. |
| **Pré-condições** | Denúncia em análise (motivo Outro) contra um anúncio disponível. |

**Passos de verificação:**

1. Acessar `/admin/denuncias?tipo_alvo=ITEM&motivo=OUTRO` e abrir a análise.
2. Selecionar **Improcedente**, preencher a resposta e confirmar.
3. Acessar `/admin/itens?busca=<título>`.

**Critérios de aceite:**
- O card mostra **"Improcedente"**, sem o botão "Analisar denúncia".
- O anúncio continua **"Disponível"**.

---

### ST-05 – Denúncia procedente contra usuário

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-05 |
| **Funcionalidade** | Resolução de denúncia com efeito na conta |
| **Comportamento esperado** | A procedência suspende a conta denunciada. |
| **Pré-condições** | Denúncia em análise (motivo Assédio) contra o doador. |

**Passos de verificação:**

1. Acessar `/admin/denuncias?tipo_alvo=USUARIO&motivo=ASSEDIO`.
2. Abrir a análise do card com o nome do doador.
3. Selecionar **Procedente**, preencher a resposta e confirmar.
4. Acessar `/admin/usuarios?email=<e-mail do doador>`.

**Critérios de aceite:**
- A denúncia mostra **"Procedente"**.
- O card do doador mostra **"SUSPENSO"**.

---

### ST-06 – Filtros da lista de usuários

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-06 |
| **Funcionalidade** | Barra de filtros em `/admin/usuarios` |
| **Comportamento esperado** | Os filtros restringem a lista e ficam na URL; "Limpar filtros" volta ao estado inicial. |
| **Pré-condições** | Conta de teste ativa; admin logado. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Preencher o nome completo, parte do e-mail, a situação **Ativo** e o perfil **Usuário**, e clicar em "Filtrar" | A URL contém `situacao=ATIVO` e `perfil=USUARIO`; só um card, o da conta, aparece |
| 2 | Trocar o perfil para **Administrador** e clicar em "Filtrar" | `"Nenhum usuário encontrado."` |
| 3 | Clicar em "Limpar filtros (n)" | A URL fica sem `email=` e o campo nome fica vazio |

**Critérios de aceite:**
- O e-mail **parcial** é aceito (busca "contém").

---

### ST-07 – Suspensão de usuário

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-07 |
| **Funcionalidade** | Card do usuário – "Suspender" |
| **Comportamento esperado** | A suspensão exige justificativa e impede a conta de entrar. |
| **Pré-condições** | Conta de teste ativa; admin logado. |

**Passos de verificação:**

1. Abrir `/admin/usuarios?email=<e-mail>` e clicar em **"Suspender"**.
2. Conferir que "Confirmar suspensão" está desabilitado.
3. Preencher a justificativa e clicar em **"Confirmar suspensão"**.
4. Sair, acessar `/login` e tentar entrar com a conta suspensa.

**Critérios de aceite:**
- O campo de data não aceita datas passadas (a data mínima é amanhã).
- O card mostra **"SUSPENSO"** e o botão "Reativar".
- No login aparece `[data-test="mensagemErroLogin"]` e a URL continua `/login`.

---

### ST-08 – Reativação de usuário

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-08 |
| **Funcionalidade** | Card do usuário – "Reativar" |
| **Comportamento esperado** | Reativar pede confirmação; cancelar não altera nada. |
| **Pré-condições** | Conta de teste suspensa. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Clicar em "Reativar" e **cancelar** a confirmação | O card continua "SUSPENSO" |
| 2 | Clicar em "Reativar" e **confirmar** | O card mostra "ATIVO" e o botão "Suspender" volta |

**Critérios de aceite:**
- A confirmação é pedida a cada clique.

---

### ST-09 – Inativação de usuário

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-09 |
| **Funcionalidade** | Card do usuário – "Inativar" |
| **Comportamento esperado** | A conta inativa perde as ações de situação. |
| **Pré-condições** | Conta de teste ativa. |

**Passos de verificação:**

1. Clicar em **"Inativar"** e confirmar.

**Critérios de aceite:**
- O card mostra **"INATIVO"**.
- Os botões "Suspender" e "Inativar" não aparecem mais.

---

### ST-10 – Promover a administrador e voltar a usuário

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-10 |
| **Funcionalidade** | Card do usuário – "Tornar administrador" / "Voltar a usuário" |
| **Comportamento esperado** | A mudança de perfil vale no próximo login da conta. |
| **Pré-condições** | Conta de teste ativa, perfil Usuário. |

**Passos de verificação:**

1. Clicar em **"Tornar administrador"** e confirmar.
2. Entrar de novo com a conta promovida e acessar `/admin/dashboard`.
3. Como admin, clicar em **"Voltar a usuário"** no card e confirmar.
4. Entrar de novo com a conta e acessar `/admin/dashboard`.

**Critérios de aceite:**
- Após o passo 1, o card mostra **"Administrador"**.
- No passo 2, a URL continua `/admin/dashboard`.
- Após o passo 3, o card mostra **"Usuário"**.
- No passo 4, a conta é levada para `/`.

> **Observação:** a API revoga as sessões da conta quando o perfil muda. Por isso os passos 2 e 4 precisam de um novo login.

---

### ST-11 – Admin tenta alterar o próprio perfil

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-11 |
| **Funcionalidade** | Card do próprio admin – "Voltar a usuário" |
| **Comportamento esperado** | A API recusa e a tela mostra o motivo. |
| **Pré-condições** | Admin logado. |

**Passos de verificação:**

1. Abrir `/admin/usuarios?email=<e-mail do admin>`.
2. Clicar em **"Voltar a usuário"** e confirmar.

**Critérios de aceite:**
- O card exibe `"Não é permitido alterar o próprio perfil de acesso por esta rota."`.
- O perfil continua **"Administrador"**.

---

### ST-12 – Criar categoria e recusar nome repetido

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-12 |
| **Funcionalidade** | Formulário "Nova categoria" (`/admin/categorias`) |
| **Comportamento esperado** | Cria a categoria e recusa um nome que já existe. |
| **Pré-condições** | Admin logado. |

**Passos de verificação:**

1. Preencher o nome (único), a ordem `0` e a descrição, e clicar em **"Criar categoria"**.
2. Preencher o **mesmo nome** de novo e clicar em **"Criar categoria"**.

**Critérios de aceite:**
- No passo 1, `[role="status"]` exibe `"Categoria criada."` e o card aparece com "Ativa" e a descrição.
- No passo 2, a seção "Nova categoria" exibe `[role="alert"]` e o nome digitado continua no campo.

> As categorias criadas no teste devem ser excluídas ao final, para não aparecerem nos formulários reais.

---

### ST-13 – Nome da categoria obrigatório

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-13 |
| **Funcionalidade** | Validação do formulário "Nova categoria" |
| **Comportamento esperado** | O formulário não é enviado sem nome. |
| **Pré-condições** | Admin logado. |

**Passos de verificação:**

1. Clicar em **"Criar categoria"** com o nome vazio.

**Critérios de aceite:**
- O navegador bloqueia o envio (campo obrigatório) e nenhuma mensagem "Categoria criada." aparece.
- O nome aceita de 2 a 60 caracteres.

---

### ST-14 – Editar categoria

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-14 |
| **Funcionalidade** | Card de categoria – "Editar" |
| **Comportamento esperado** | O nome e a ordem são atualizados na lista. |
| **Pré-condições** | Categoria de teste existente. |

**Passos de verificação:**

1. Clicar em **"Editar"** no card.
2. Mudar o nome e a ordem para `1`.
3. Clicar em **"Salvar alterações"**.

**Critérios de aceite:**
- O card aparece com o nome novo e "Ordem 1".

---

### ST-15 – Categoria inativa some da nova doação

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-15 |
| **Funcionalidade** | Situação da categoria × formulário de nova doação |
| **Comportamento esperado** | Só categorias ativas podem ser escolhidas por quem anuncia. |
| **Pré-condições** | Categoria de teste ativa. |

**Passos de verificação:**

1. Editar a categoria, desmarcar "Ativa" e salvar.
2. Entrar com uma conta comum e acessar `/doacoes/nova`.
3. Como admin, editar de novo, marcar "Ativa" e salvar.

**Critérios de aceite:**
- Após o passo 1, o card mostra **"Inativa"**.
- No passo 2, a lista de categorias **não** contém a categoria.
- Após o passo 3, o card volta a mostrar **"Ativa"**.

---

### ST-16 – Excluir categoria com confirmação

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-16 |
| **Funcionalidade** | Card de categoria – "Excluir" |
| **Comportamento esperado** | Só exclui depois da confirmação. |
| **Pré-condições** | Categoria de teste existente. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Clicar em "Excluir" e **cancelar** a confirmação | A categoria continua na lista |
| 2 | Clicar em "Excluir" e **confirmar** | A categoria sai da lista |

---

### ST-17 – Filtros da lista de anúncios

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-17 |
| **Funcionalidade** | Barra de filtros em `/admin/itens` |
| **Comportamento esperado** | A busca e a situação restringem a lista; "Todas" inclui os cancelados. |
| **Pré-condições** | Lote com 2 anúncios ("<lote> mesa" e "<lote> cadeira"), com a cadeira já cancelada. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Buscar pelo nome do lote e clicar em "Filtrar" | `"2 anúncio(s) encontrado(s)"`; a URL contém `busca=` |
| 2 | Selecionar a situação **Cancelado** e clicar em "Filtrar" | `"1 anúncio(s) encontrado(s)"`; só a cadeira, com "Cancelado" |
| 3 | Clicar em "Limpar filtros (n)" | A URL fica sem `busca=` |

---

### ST-18 – Cancelar anúncio com motivo

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-18 |
| **Funcionalidade** | Card de anúncio – "Cancelar anúncio" |
| **Comportamento esperado** | O cancelamento exige motivo (mínimo de 10 caracteres) e o doador recebe esse motivo. |
| **Pré-condições** | Anúncio disponível; admin logado. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Clicar em "Cancelar anúncio", digitar `"curto"` e confirmar | O cancelamento é recusado; o anúncio continua "Disponível" |
| 2 | Digitar um motivo válido e confirmar | `[role="status"]` contém "Anúncio cancelado."; o card mostra "Cancelado" e o motivo, sem o botão de cancelar |
| 3 | Entrar como doador e acessar `/perfil/notificacoes` | A notificação "Anúncio cancelado pela moderação" traz o motivo |

---

### ST-19 – Anúncio doado não pode ser cancelado

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-19 |
| **Funcionalidade** | Card de anúncio – regra de exibição do cancelamento |
| **Comportamento esperado** | Anúncios doados não oferecem cancelamento. |
| **Pré-condições** | Doação concluída: interesse, aceite, entrega e recebimento confirmados. |

**Passos de verificação:**

1. Acessar `/admin/itens?busca=<título>`.

**Critérios de aceite:**
- O card mostra **"Doado"**.
- O botão "Cancelar anúncio" não existe.

---

### ST-20 – Auditoria do cancelamento de anúncio

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-20 |
| **Funcionalidade** | Trilha de auditoria (`/admin/auditoria`) |
| **Comportamento esperado** | O cancelamento fica registrado com a justificativa e é encontrado pelos filtros. |
| **Pré-condições** | Anúncio cancelado pelo admin com um motivo conhecido. |

**Passos de verificação e resultados esperados:**

| Passo | Ação | Resultado esperado |
|-------|------|--------------------|
| 1 | Selecionar a ação **Cancelamento de anúncio** e clicar em "Filtrar" | A URL contém `tipo_acao=CANCELAMENTO_ITEM`; o registro mostra o título, a ação e a justificativa |
| 2 | Selecionar o alvo **Usuário** e clicar em "Filtrar" | O registro do anúncio sai da lista |

---

### ST-21 – Auditoria do bloqueio de usuário

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-21 |
| **Funcionalidade** | Trilha de auditoria – filtros pela URL |
| **Comportamento esperado** | O bloqueio fica registrado com a justificativa. |
| **Pré-condições** | Conta bloqueada pelo admin com uma justificativa conhecida. |

**Passos de verificação:**

1. Acessar `/admin/auditoria?tipo_acao=BLOQUEIO_USUARIO&tipo_alvo=USUARIO`.
2. Clicar em **"Limpar filtros (2)"**.

**Critérios de aceite:**
- O registro mostra o nome da conta, a ação de bloqueio e a justificativa.
- Após limpar, a URL fica sem `tipo_acao=`.

---

### ST-22 – Visitante tenta abrir o painel

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-22 |
| **Funcionalidade** | Rotas protegidas (`proxy.ts`) |
| **Comportamento esperado** | O visitante vai para o login, e a tela pedida é preservada. |
| **Pré-condições** | Sem sessão; front sem login automático de desenvolvimento. |

**Passos de verificação:**

1. Acessar `/admin/usuarios?situacao=ATIVO`.

**Critérios de aceite:**
- A URL vira `/login` com `redirect=%2Fadmin%2Fusuarios%3Fsituacao%3DATIVO`.

---

### ST-23 – Usuário comum tenta abrir o painel

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-23 |
| **Funcionalidade** | Layout do admin – exigência de administrador ativo |
| **Comportamento esperado** | Nenhuma tela do admin abre para um usuário comum. |
| **Pré-condições** | Conta comum logada. |

**Passos de verificação:**

1. Acessar, uma por vez: `/admin/dashboard`, `/admin/usuarios`, `/admin/itens`, `/admin/denuncias`, `/admin/categorias`, `/admin/auditoria`.

**Critérios de aceite:**
- Em todas, a URL final é `/`.

---

### ST-24 – Navegação do admin pelo menu lateral

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-24 |
| **Funcionalidade** | Menu lateral do admin |
| **Comportamento esperado** | Cada item do menu abre a sua tela. |
| **Pré-condições** | Admin logado. |

**Passos de verificação:**

1. Em `/admin/dashboard`, clicar em: Dashboard, Usuários, Anúncios, Denúncias, Categorias, Auditoria.

**Critérios de aceite:**
- As URLs são, na ordem: `/admin/dashboard`, `/admin/usuarios`, `/admin/itens`, `/admin/denuncias`, `/admin/categorias`, `/admin/auditoria`.

---

### ST-25 – Dashboard com métricas ao vivo

| Campo | Conteúdo |
|-------|----------|
| **ID** | ST-25 |
| **Funcionalidade** | `/admin/dashboard` |
| **Comportamento esperado** | Mostra os indicadores e conecta a atualização automática. |
| **Pré-condições** | Admin logado. |

**Passos de verificação:**

1. Acessar `/admin/dashboard`.

**Critérios de aceite:**
- Há 6 indicadores `[data-metrica]`.
- `[data-test="estadoAoVivo"]` passa a mostrar "Ao vivo".
- O texto "Indisponível" não aparece.

---

## Arquivos Cypress previstos

| Arquivo | Suite(s) a cobrir | Situação |
|---------|-------------------|----------|
| `cypress/e2e/admin/denuncias.cy.ts` | ST-01, ST-02, ST-03, ST-04, ST-05 | A implementar |
| `cypress/e2e/admin/usuarios.cy.ts` | ST-06, ST-07, ST-08, ST-09, ST-10, ST-11 | A implementar |
| `cypress/e2e/admin/categorias.cy.ts` | ST-12, ST-13, ST-14, ST-15, ST-16 | A implementar |
| `cypress/e2e/admin/anuncios.cy.ts` | ST-17, ST-18, ST-19 | A implementar |
| `cypress/e2e/admin/auditoria.cy.ts` | ST-20, ST-21 | A implementar |
| `cypress/e2e/admin/acesso.cy.ts` | ST-22, ST-23, ST-24 | A implementar |
| `cypress/e2e/admin/dashboard.cy.ts` | ST-25 | A implementar |

**Fora do escopo desta suíte:**
- paginação com filtros;
- fluxos de doação, perfil e páginas públicas (próximas sprints).

---

## Responsável

- **Autor:** José Martines 
- **Criado em:** 25/11/2026
- **Última atualização:** 25/11/2026
