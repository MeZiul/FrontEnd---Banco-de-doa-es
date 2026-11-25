import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_TOKEN, loginDevAtivo } from "@/lib/auth-cookie";

export function proxy(request: NextRequest) {
    if (loginDevAtivo()) return NextResponse.next();

    // Verifica a presença do cookie do login tradicional
    const possuiSessaoTradicional = request.cookies.has(COOKIE_TOKEN);

    // Verifica a presença dos cookies de sessão do Better Auth
    const possuiSessaoOAuth =
        request.cookies.has("better-auth.session_token") ||
        request.cookies.has("__Secure-better-auth.session_token");

    // Redireciona somente quando não existir nenhum cookie de sessão
    if (!possuiSessaoTradicional && !possuiSessaoOAuth) {
        const login = new URL("/login", request.url);

        login.searchParams.set(
            "redirect",
            request.nextUrl.pathname + request.nextUrl.search
        );

        return NextResponse.redirect(login);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/perfil/:path*",
        "/admin/:path*",
        "/itens-doacao/:path*",
        "/doacoes/nova/:path*",
    ],
};