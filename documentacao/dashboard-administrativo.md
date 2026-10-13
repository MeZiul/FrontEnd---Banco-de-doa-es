# Dashboard administrativo

`/admin/dashboard` consulta o backend vigente no servidor. O layout e a página/DAL consultam `/perfil` novamente e exigem `perfil=ADMINISTRADOR` e `situacao=ATIVO`. Nenhum token, registro de usuário ou documento das listagens é passado ao cliente. Cada requisição do dashboard tem deadline de 10 segundos. Sessão inválida redireciona para login; perda da função administrativa e 403 durante a consulta dos indicadores redirecionam para a página inicial. Se a guarda compartilhada da conta receber 403 em `/perfil` por suspensão, ela mostra conta indisponível e omite todo o conteúdo protegido.

## Contratos dos indicadores

Todas as chamadas abaixo usam GET, page=1 e limit=1. A contagem exibida é exclusivamente `data.totalDocs`, nunca o tamanho de `data.docs`. O backend calcula COUNT com os mesmos filtros da listagem em `BaseRepository.listarComPaginacao`. Os filtros foram conferidos nos schemas, controllers, services e repositories atuais do backend.

| Indicador | Endpoint | Filtro adicional |
| --- | --- | --- |
| Usuários cadastrados | /admin/usuarios | nenhum |
| Usuários ativos | /admin/usuarios | situacao=ATIVO |
| Itens cadastrados | /admin/itens | soma de cinco consultas: status=DISPONIVEL, RESERVADO, AGUARDANDO_CONFIRMACAO, DOADO e CANCELADO |
| Itens disponíveis | /admin/itens | status=DISPONIVEL |
| Doações concluídas | /admin/itens | status=DOADO |
| Denúncias em análise | /admin/denuncias | status=EM_ANALISE |

Os seis indicadores usam dez consultas independentes e paralelas: não constituem um snapshot transacional. A API assume DISPONIVEL quando status está ausente, portanto o total de itens soma os cinco estados disjuntos aceitos pelo schema; se uma parcela falhar, o total fica indisponível. Doações concluídas são a contagem de itens DOADO, não a soma dos contadores de usuários. Não há SSE, séries históricas, tendências ou percentuais estimados. As páginas de gestão dos colegas permanecem sob as respectivas issues #26–28; o dashboard não implementa essas telas.

## Estados e validação

Contagem válida zero é exibida como 0. Falha de rede, timeout, resposta incompleta ou totalDocs inválido aparece como Indisponível, preservando as demais métricas e oferecendo nova consulta. Se todas as contagens forem zero, há mensagem de vazio. Loading usa skeleton sem valores inventados. Falhas gerais da página têm boundary administrativo com retry() conforme Next vigente. Falha ao verificar acesso no layout fecha o conteúdo administrativo e mostra feedback com nova consulta; redirecionamentos do Next são preservados.

Validação automatizada: `node --test tests/*.test.mjs`, `npm run lint`, `npm run build`. O teste de métricas verifica contagem acima de uma página, filtros, DTO mínimo, zero, falhas parciais, resposta inválida e revogação de acesso. QA de navegador deve comparar as contagens com as respostas reais da API/COUNT PostgreSQL, verificar usuário comum e administrador, revogar a função e repetir a consulta, conferir mobile e injetar falha local para provar retry. Sessões de fixture local não são prova de um novo login nem de produção.
