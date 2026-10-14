# Frontend na VM

O endereço público é https://doai-doa.app.fslab.dev/. O frontend Next.js é publicado como container com `output: standalone`. O build mantém as Server Actions, a sessão Better Auth e o acesso à API em `https://api.doai.fs.fslab.dev`. Não é uma exportação estática.

A VM tem aproximadamente 1 GiB de RAM. Faça o build na máquina de desenvolvimento ou em um executor com recursos suficientes; transfira a imagem pronta para a VM por SSH. O container de execução limita a memória a 512 MiB e o heap Node a 320 MiB, roda como usuário sem privilégios e mantém o filesystem somente leitura, com cache temporário.

```sh
docker build --platform linux/amd64 --build-arg SOURCE_COMMIT=COMMIT -t doai-frontend:COMMIT .
docker save doai-frontend:COMMIT -o frontend-COMMIT.tar
scp -P 60011 frontend-COMMIT.tar fslab@cloud.fslab.dev:~/doai-frontend/
```

Na VM, confira o hash do arquivo transferido antes de carregar a imagem. Preserve a imagem e o identificador do container anterior antes de qualquer substituição.

```sh
docker load -i frontend-COMMIT.tar
DOAI_FRONTEND_IMAGE=doai-frontend:COMMIT docker compose -f compose.production.yml -f compose.tls.yml up -d
docker compose -f compose.production.yml -f compose.tls.yml ps
curl --fail https://doai-doa.app.fslab.dev/
```

O encaminhamento FSLab desta VM usa HTTPS na porta 80. Use os dois arquivos Compose: `compose.tls.yml` coloca a entrada TLS na porta 80, que encaminha para o Next.js na porta 3000 da rede Docker. Copie a pasta `deployment` para `~/doai-frontend/deployment`. O diretório privado `~/doai-frontend/tls` contém `key.pem` e `cert.pem`, legíveis pelo UID 1001; chave e certificado nunca entram na imagem ou no Git. O certificado público do domínio é administrado pela FSLab; o certificado interno precisa ser compatível com a política de confiança desse proxy e renovado antes de expirar. Não execute apenas o Compose base nessa configuração, pois ele atenderia HTTP onde o proxy envia TLS.

A entrada preserva Host e X-Forwarded-Host e informa X-Forwarded-Proto HTTPS para as Server Actions e os cookies seguros. Confira também os assets, busca, login, redirecionamento de usuário autenticado, logout e chamadas à API pelo domínio público; uma resposta local não comprova o acesso externo.

`NEXT_PUBLIC_API_URL` é definido no build. Para trocar a API, gere uma nova imagem. Não transfira arquivos `.env` de desenvolvimento, credenciais de login dev, chave SSH ou tokens Vercel na imagem. O contexto Docker exclui esses arquivos.

Quando frontend e API estão em VMs da mesma rede privada, configure `API_INTERNAL_URL` no ambiente de execução do Compose para o endereço interno da API. Essa variável só é usada nas chamadas do servidor: catálogo, sessão Better Auth, ações e upload. O Origin de autenticação continua sendo a origem pública da API, preservando a validação CSRF. Sem essa variável, o servidor usa a URL pública. Não exponha o endereço privado em uma variável `NEXT_PUBLIC_`; imagens exibidas diretamente pelo navegador continuam dependendo da URL pública da API. Restrinja o acesso à rede privada conforme a política da infraestrutura.

O GitLab continua executando testes, lint e build. Os jobs de publicação na Vercel foram retirados. Como o acesso SSH da VM está limitado à máquina de desenvolvimento, o executor GitLab não faz publicação direta: a imagem validada deve ser transferida dessa máquina. Nenhuma integração entre `dev` e `main` é necessária.
