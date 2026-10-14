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

Nas chamadas das Server Actions, o cliente envia `Origin` derivado de `NEXT_PUBLIC_API_URL`, incluindo as chamadas com Bearer. Essa origem deve ser confiável na API; a proteção de origem do Better Auth permanece habilitada em produção.

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

O frontend está publicado em `https://doai-doa.app.fslab.dev/`, na VM dedicada, e usa a API pública `https://doai.app.fslab.dev`. `.gitlab-ci.yml` valida pushes e MRs com testes, lint e build; atualmente não executa publicação automática.

Para publicar na VM, siga o [roteiro de implantação](documentacao/deploy-vm.md). A entrada TLS encaminha para o Next.js, e as chamadas do servidor usam `API_INTERNAL_URL` quando configurada. Use os dois arquivos Compose de produção e TLS, preservando a configuração privada da VM. A mudança de endereço público da API exige nova build, porque `NEXT_PUBLIC_API_URL` é incorporada no bundle. A configuração anterior da Vercel foi substituída por este fluxo; sucesso no pipeline comprova validação, não atualização da VM.

## Limitações conhecidas

Há alertas residuais de dependências acompanhados nas issues. O envio real de recuperação de senha depende da configuração SMTP da API. A fonte Figma é referência funcional; o design aplicado e os componentes atuais prevalecem.
