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
DOAI_FRONTEND_IMAGE=doai-frontend:COMMIT docker compose -f compose.production.yml up -d
docker compose -f compose.production.yml ps
curl --fail http://127.0.0.1/
```

A porta 80 da VM encaminha para a porta 3000 do container. O domínio público deve passar pelo proxy HTTPS da infraestrutura. Esse proxy precisa preservar Host, X-Forwarded-Host e X-Forwarded-Proto para as Server Actions e os cookies seguros. Confira também os assets, busca, login, redirecionamento de usuário autenticado, logout e chamadas à API pelo domínio público; uma resposta local não comprova o acesso externo.

`NEXT_PUBLIC_API_URL` é definido no build. Para trocar a API, gere uma nova imagem. Não transfira arquivos `.env` de desenvolvimento, credenciais de login dev, chave SSH ou tokens Vercel na imagem. O contexto Docker exclui esses arquivos.

O GitLab continua executando testes, lint e build. Os jobs de publicação na Vercel foram retirados. Como o acesso SSH da VM está limitado à máquina de desenvolvimento, o executor GitLab não faz publicação direta: a imagem validada deve ser transferida dessa máquina. Nenhuma integração entre `dev` e `main` é necessária.
