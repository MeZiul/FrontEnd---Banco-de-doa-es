# Doaí — frontend do Banco de Doações

Aplicação acadêmica em Next.js 16, React 19 e Tailwind CSS 4. A API separada usa Express, Better Auth, Prisma e PostgreSQL. O frontend mantém a identidade visual azul da equipe; Storybook reutiliza os componentes da aplicação.

## Executar localmente

Use Node.js 24 e npm, como no pipeline. Instale com `npm ci`, configure `NEXT_PUBLIC_API_URL` em `.env.local` conforme o endereço da API escolhida e execute `npm run dev`. A aplicação abre em `http://localhost:5173`.

`.env.example` documenta a configuração. Não versione `.env.local`, tokens ou senhas. A URL de API é configuração pública, incorporada na build; deve ser definida antes de compilar. A configuração de desenvolvimento `DEV_LOGIN_EMAIL`/`DEV_LOGIN_SENHA` é opcional e não deve ser habilitada em Preview/Production ou testes de visitante.

O frontend não inicia o banco nem a API. Para desenvolvimento isolado, prepare esses serviços pelo repositório backend. Usar a API remota significa acessar dados reais: não execute seeds ou jornadas destrutivas de apresentação nela.

## Jornada e rotas

| Rota | Comportamento |
| --- | --- |
| `/` | Início, busca e até quatro doações recentes da API. |
| `/busca` | Resultados, filtros de categoria/condição/localização/ordenação e paginação. |
| `/doacoes/[id]` | Anúncio completo e ações permitidas pela sessão. |
| `/ajuda` | Orientações, perguntas frequentes e acesso ao registro de problemas. |
| `/termos`, `/privacidade` | Documentos públicos com conteúdo acadêmico compatível com a implementação. |
| `/login`, `/cadastro` | Visitantes e sessões inválidas/expiradas; sessão válida redireciona ao início. |
| `/perfil` e páginas internas | Perfil, anúncios, solicitações, avaliações e notificações da conta. |
| `/admin/*` | Administração, denúncias, métricas e auditoria com autorização da API. |

URLs antigas de busca na raiz redirecionam para `/busca`, preservando os filtros. Os cards públicos expandem detalhes por mouse ou teclado, respeitando movimento reduzido. Estados vazios, indisponibilidade e nova tentativa são distintos.

O link de problema técnico na ajuda usa o GitLab e exige acesso ao projeto. Não existe um canal anônimo próprio de suporte. Denúncias de item/usuário são uma funcionalidade diferente. Os documentos acadêmicos não implicam aprovação jurídica.

## Autenticação e contrato

Os fluxos de login, cadastro, sessão, logout e recuperação de senha usam o SDK Better Auth e os endpoints nativos em `/api/auth`. O token opaco fica em cookie HttpOnly; as Server Actions e páginas verificam a sessão pelo Better Auth antes de consultar os dados do domínio. A API mantém as validações de CPF, senha e situação da conta. Sessões válidas são verificadas também antes de submeter login/cadastro em abas antigas; erros de infraestrutura mostram recuperação e não são tratados como expiração.

As telas administrativas mantêm `pagina` no estado da interface e enviam `page`/`limit` na consulta HTTP. Auditoria aceita alvos de usuário, item, denúncia ou removidos; o texto livre não permite inferir sozinho a medida aplicada pelo backend.

## Verificar

```text
node --test tests/*.test.mjs
npm run lint
npm run build
```

A CI executa esses checks. Os testes de contrato não substituem validação da API/banco reais. Cypress usa `http://localhost:5173`; os cenários que criam dados precisam de ambiente próprio e contas de teste, nunca de coleção destrutiva na produção.

## Storybook

```text
npm run storybook
npm run build-storybook
```

O modo de desenvolvimento abre em `http://localhost:6006`. A build gera `storybook-static/` com HTML, JavaScript e CSS, para servir por HTTP. Histórias incluem início, busca, cartões expansíveis, ajuda, termos e privacidade, exemplos realistas, vazio e erros; essas fixtures não são inseridas na API. Há seletores de tema/viewport e addon de acessibilidade; a existência do addon não equivale a conformidade WCAG comprovada.

## Publicação

`.gitlab-ci.yml` valida pushes e MRs. Um push na `dev` protegida publica **Preview** com target explícito. Um push na `main` protegida usa **Production**, quando essa branch contiver o pipeline.

`VERCEL_TOKEN` é configurado pelo responsável no GitLab como masked/protected/hidden, com escopos separados `preview` e `production`. IDs públicos do projeto estão no pipeline; o valor do token nunca deve ser colocado no repositório. Preview usa a API remota e não oferece um banco isolado. Sucesso da build e disponibilidade de Preview não comprovam atualização do domínio Production.

## Limitações conhecidas

Há alertas residuais de dependências acompanhados nas issues. O envio real de recuperação de senha depende da configuração SMTP da API. A fonte Figma é referência funcional; o design aplicado e os componentes atuais prevalecem.
