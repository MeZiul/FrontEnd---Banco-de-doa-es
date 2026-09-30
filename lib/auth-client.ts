import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    basePath: "/api/auth",
    fetchOptions: {
        credentials: "include"
    },
    plugins: [
        adminClient(),
        inferAdditionalFields({
            user: {
                cpf: { type: "string" },
                telefone: { type: "string" },
                cidade: { type: "string" },
                uf: { type: "string" }
            }
        })

    ]
})

export const { signIn, signUp, signOut, useSession } = authClient