# Publicação e atualizações por commit

O projeto `doai-banco-de-doacoes` pertence ao escopo `guilherme-dalanhols-projects` e foi criado/vinculado com Vercel CLI63.1.0. Runtime configurado Node24 e framework Next.js. URL da API: `https://api.doai.fs.fslab.dev`, configurada em `NEXT_PUBLIC_API_URL` nos ambientes Vercel usados.

GitLab FSLab é self-managed. A integração nativa Vercel para esse tipo de GitLab não está disponível; `.gitlab-ci.yml` publica pela CLI após validação. Cada push na branch protegida `dev` executa build/deploy de produção. `main` permanece intocada. Merge requests e branches sem proteção executam validação sem credencial de deploy.

Para habilitar a publicação automática, o responsável configura `VERCEL_TOKEN` diretamente em Settings → CI/CD → Variables do projeto GitLab, masked, protected, com escopo production. Criar o token no escopo apropriado da Vercel e nunca copiar para o chat, arquivos versionados ou logs. O pipeline não disponibiliza esse token a branches não protegidas. Exige runner disponível no GitLab. O job serializa deploys por resource_group. A primeira publicação local via CLI pode funcionar antes dessa credencial CI, mas não comprova automação por commit.

Comandos locais no checkout vinculado: `npx --yes vercel@63.1.0 deploy --prod --yes --scope guilherme-dalanhols-projects`. Verificar inspect/status, feed, cadastro/login, recarga da sessão, ação protegida e carregamento de foto com API HTTPS antes de anunciar a entrega.

Referências oficiais:
- https://vercel.com/kb/guide/can-i-use-self-managed-gitlab-with-vercel
- https://vercel.com/kb/guide/how-can-i-use-gitlab-pipelines-with-vercel
