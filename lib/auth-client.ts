import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const authClient = createAuthClient({
    baseURL: API_URL,
    basePath:"/auth",
    fetchOptions:{
        credentials:"include"
    },
    plugins:[adminClient()]
})

export const {signIn, signOut, useSession} = authClient