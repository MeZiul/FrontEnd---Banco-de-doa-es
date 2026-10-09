# Perfil próprio e recuperação de senha

- `/perfil/editar` requer sessão; consulta `GET /perfil` e salva com `PUT /perfil`. A identidade vem do cookie HttpOnly no servidor e da sessão da API, nunca de um ID enviado pelo formulário.
- Campos editáveis desta tela: nome, e-mail, telefone, cidade, UF e apresentação (`bio`). CPF, foto existente, permissões, situação e contadores são preservados. Telefone e apresentação podem ficar vazios.
- A ação valida novamente os campos, encaminha somente a whitelist e limita o request a 10 segundos. Sucesso revalida os layouts; conflito de e-mail mantém os dados preenchidos e mostra o erro; uma sessão expirada redireciona ao login.
- `/esqueci-senha` usa `POST /auth/esqueci-senha` com `{ email }` e exibe uma mensagem genérica para evitar revelar se a conta existe.
- O e-mail gerado pelo backend aponta para `/redefinir-senha?token=...`. Essa página exige confirmação da nova senha e usa `PUT /auth/redefinir-senha` com `{ token, novaSenha }`. Não usa endpoints nativos Better Auth bloqueados.
- A política de senha segue a fachada existente: 8 a 128 caracteres, maiúscula, minúscula, número e símbolo `@$!%*?&`. Token ausente/inválido/expirado permite solicitar outro link. O backend consome o token e revoga as sessões anteriores quando o reset conclui.
- Configure `FRONTEND_URL` no backend para a origem pública correta. SMTP precisa funcionar para entrega real; o preview com `DISABLED_EMAIL=true` não comprova envio de e-mail. O frontend nunca recebe credenciais SMTP nem revela o token na confirmação.
- A página de reset usa `no-referrer` e desativa indexação. O link contém um token temporário: não o copie para logs, exemplos ou artefatos.

Validações locais: `node --test tests/*.test.mjs`, `npm run lint` e `npm run build`. Os testes de ações isolam o transporte; uma validação de navegador com API/PostgreSQL é necessária para provar persistência, reset e revogação reais.
