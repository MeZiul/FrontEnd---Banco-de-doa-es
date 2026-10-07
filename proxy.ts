import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_TOKEN, loginDevAtivo } from "@/lib/auth-cookie";

export function proxy(request: NextRequest) {
    if (loginDevAtivo()) return NextResponse.next();

    if (!request.cookies.has(COOKIE_TOKEN)) {
        const login = new URL("/login", request.url);
        login.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(login);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/perfil/:path*", "/admin/:path*", "/itens-doacao/:path*"],
};