# Publicação por branch no GitLab FSLab

O projeto `doai-banco-de-doacoes` pertence ao escopo `guilherme-dalanhols-projects` e foi criado/vinculado com Vercel CLI63.1.0. Runtime configurado Node24 e framework Next.js. URL da API: `https://api.doai.fs.fslab.dev`, configurada em `NEXT_PUBLIC_API_URL` nos ambientes Vercel usados.

GitLab FSLab é self-managed; `.gitlab-ci.yml` publica pela CLI no runner após validação. Push/merge na `dev` protegida publica Preview; push/merge na `main` protegida publica Production. Merge requests e outras branches executam testes, lint e build sem publicação. Uma falha de validação impede o deploy.

As regras usam os nomes explícitos `dev` e `main`: a branch padrão do GitLab atualmente é `dev`, portanto `CI_DEFAULT_BRANCH` não define produção neste projeto. O job de produção só entrará em vigor quando o arquivo de CI estiver presente na `main` por um merge autorizado. Este trabalho integra mudanças somente na `dev`, sem promover código para `main`.

Para habilitar a publicação automática, o responsável configura `VERCEL_TOKEN` diretamente em Settings → CI/CD → Variables, masked/protected: uma variável com escopo `preview` e outra com escopo `production`. O valor pode ser o mesmo token Vercel autorizado para o projeto; nunca enviar para o chat, arquivos versionados ou logs. Os jobs de deploy exigem branch protegida e pipeline de push. A validação não usa a credencial. Exige runner disponível no GitLab. Os jobs serializam deploys por ambiente e registram branch/SHA nos metadados. A configuração ou um deploy manual isolado não comprova automação por commit.

Configurar `NEXT_PUBLIC_API_URL=https://api.doai.fs.fslab.dev` nos ambientes Vercel Preview e Production. Ambos apontam inicialmente para a mesma API e banco: Preview do frontend não equivale a um backend ou banco de homologação. Ações de cadastro, edição e exclusão podem afetar dados reais. Usar contas sintéticas próprias; não executar a collection de testes contra produção sem escopo específico.

Comandos locais no checkout vinculado: `npx --yes vercel@63.1.0 deploy --yes --scope guilherme-dalanhols-projects` publica Preview; adicionar `--prod` publica Production. Verificar inspect/status e URL no log do job, feed, cadastro/login, recarga da sessão, ação protegida e carregamento de foto com API HTTPS antes de anunciar a entrega. O pipeline não cria automaticamente comentários com links nos MRs.

Referências oficiais:
- https://vercel.com/kb/guide/can-i-use-self-managed-gitlab-with-vercel
- https://vercel.com/kb/guide/how-can-i-use-gitlab-pipelines-with-vercel
