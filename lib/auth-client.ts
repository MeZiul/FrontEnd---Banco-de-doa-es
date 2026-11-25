import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        cpf:                { type: "string", required: false, input: false },
        telefone:           { type: "string", required: false, input: false },
        cidade:             { type: "string", required: false, input: false },
        uf:                 { type: "string", required: false, input: false },
        cadastro_completo:  { type: "boolean", required: false, defaultValue: false, input: false }
      }
    })
  ]
});

export const { signIn, signUp, signOut, useSession } = authClient;
