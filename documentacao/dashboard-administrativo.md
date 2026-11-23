# Dashboard administrativo

`/admin/dashboard` mostra seis indicadores e os atualiza em tempo real por SSE (Server-Sent Events). O layout e a página/DAL consultam `/perfil` novamente e exigem `perfil=ADMINISTRADOR` e `situacao=ATIVO`. Nenhum token, registro de usuário ou documento das listagens é passado ao cliente. Sessão inválida redireciona para login; perda da função administrativa e 403 redirecionam para a página inicial.

## Indicadores

A primeira pintura vem do servidor, com uma única chamada a `GET /admin/metricas` (deadline de 10 segundos). O back calcula os seis contadores na mesma transação, então eles formam um snapshot coerente.

| Indicador | Campo da API | O que conta |
| --- | --- | --- |
| Usuários cadastrados | `usuarios` | todos os usuários |
| Usuários ativos | `ativos` | usuários com situacao=ATIVO |
| Itens cadastrados | `itens` | itens em qualquer status |
| Itens disponíveis | `disponiveis` | itens com status=DISPONIVEL |
| Doações concluídas | `doados` | itens com status=DOADO |
| Denúncias em análise | `denuncias` | denúncias com status=EM_ANALISE |

`montarMetricasAdmin` (`lib/admin-metrics.ts`) valida o snapshot e cada evento do stream: só inteiros seguros e não negativos viram número; qualquer outro valor vira "Indisponível" sem esconder os demais, e campos extras não chegam ao cliente.

## Gráficos (Visão geral)

Os gráficos usam o mesmo snapshot dos indicadores e também se atualizam pelo stream. São feitos em SVG/CSS no próprio projeto (`components/admin/graficos-dashboard.tsx`), sem biblioteca.

| Gráfico | Formato | Campo da API |
| --- | --- | --- |
| Novos cadastros por mês | linha (usuários e itens, últimos 6 meses) | `novos_por_mes` |
| Itens por etapa | colunas | `itens_por_status` |
| Interesses por situação | barras horizontais | `interesses_por_status` |
| Usuários por situação | rosca | `usuarios_por_situacao` |
| Denúncias por resultado | barra segmentada | `denuncias_por_status` |

- As partes seguem a ordem do fluxo (a dos enums do back), não o tamanho.
- Todo gráfico mostra o número e a porcentagem escritos, além da cor; a linha tem uma tabela equivalente para leitores de tela e o valor de cada ponto aparece ao passar o mouse.
- Cores: azul `#2a78d6`, laranja `#eb6834` e verde-água `#1baf7a`, sempre nessa ordem. A paleta passou no validador de daltonismo; o verde-água tem contraste baixo com o branco, por isso os números escritos são obrigatórios.
- `montarGraficosAdmin` e `montarSerieMensal` validam os dados: se uma parte vier inválida, só aquele gráfico aparece como "Indisponível", para não mostrar proporção errada.

## Tempo real (SSE)

```
Navegador (EventSource) → GET /api/admin/metricas/stream (Next, cookie doai_token)
                         → GET {API}/admin/metricas/stream (Bearer)
```

- O token fica em cookie HttpOnly, então o navegador não chama a API direto: a rota `app/api/admin/metricas/stream/route.ts` valida a sessão e repassa o stream (`lib/admin-stream.ts`).
- O back confere o papel de administrador na abertura e a cada envio, e encerra o stream de quem perdeu o acesso.
- Os headers `Cache-Control: no-cache, no-transform` e `X-Accel-Buffering: no` impedem que a compressão do `next start` ou um proxy segurem os eventos.
- Respostas da rota: 401 sem sessão, 403 sem acesso de administrador, 429 com mais de 3 conexões abertas na mesma conta, 502 com o back fora do ar. A mensagem interna do back nunca é repassada.

O componente `components/admin/metricas-ao-vivo.tsx` mostra o estado da conexão:

| Estado | Quando |
| --- | --- |
| Conectando | antes do primeiro evento |
| Ao vivo | evento recebido; mostra o horário da última atualização |
| Reconectando | queda de rede ou fim da conexão de 10 minutos do back; o navegador reconecta sozinho em 5 s |
| Pausado | a rota recusou (401/403/429/502); a página é recarregada no servidor, que redireciona se o acesso caiu. Os números voltam a ser os do snapshot e o botão Atualizar indicadores continua disponível |

Aba escondida fecha a conexão e a reabre quando volta a ficar visível, para não ocupar uma das 3 vagas da conta.

Limites conhecidos: o back guarda os assinantes em memória, então os avisos valem para uma instância da API (com mais de uma, trocar por LISTEN/NOTIFY do Postgres). Em hospedagem serverless, o tempo máximo da função limita a duração do stream; o deploy em VM (`output: "standalone"`) não tem esse limite. O heartbeat de 25 s do back fica abaixo do timeout de 120 s do `deployment/tls-proxy.mjs`.

## Estados e validação

Contagem zero aparece como 0. Falha de rede, timeout ou contador inválido aparece como Indisponível, preservando os outros. Se todas as contagens forem zero, há mensagem de vazio. Loading usa skeleton sem valores inventados. Falhas gerais da página têm boundary administrativo com retry().

Validação automatizada:
- `node --test tests/*.test.mjs`: `admin-metrics.test.mjs` (validação dos contadores) e `admin-stream.test.mjs` (repasse, headers, recusas e cancelamento).
- `npm run lint` e `npm run build`.
- Cypress: `cypress/e2e/dashboard-admin.cy.ts` entra como o admin do seed (`CYPRESS_ADMIN_EMAIL` e `CYPRESS_ADMIN_SENHA`) e confere os seis cards e o estado "Ao vivo". Não grava nada no banco.
