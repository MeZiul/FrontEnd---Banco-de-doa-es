import { redirect } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";
import { destinoInterno } from "@/lib/auth-validation";
import type { Usuario } from "@/types/usuario";

type GooglePageProps = {
    searchParams: Promise<{
        destino?: string | string[];
    }>;
};

export default async function GooglePage({ searchParams }: GooglePageProps) {
    const parametros = await searchParams;
    const destino = destinoInterno(parametros.destino);

    // Recupera exclusivamente uma sessão real
    const token = await getToken({ permitirLoginDev: false });

    if (!token || !(await validarSessaoNativa(token))) {
        redirect("/login?erro=sessao");
    }

    let usuario: Usuario;

    try {
        // Consulta o estado cadastral atualizado no backend
        usuario = await fetchApi<Usuario>("perfil", {
            token,
            signal: AbortSignal.timeout(10_000)
        });
    } catch (erro) {
        if (erro instanceof ErroApi && [401, 403, 498].includes(erro.status)) {
            redirect("/login?erro=sessao");
        }

        throw erro;
    }

    // Verifica se o perfil retornado é válido
    if (!usuario?._id || usuario.situacao !== "ATIVO") {
        redirect("/login?erro=sessao");
    }

    // Encaminha usuários que ainda precisam completar seus dados
    if (usuario.cadastro_completo !== true) {
        redirect("/cadastro?origem=google");
    }

    // Evita retornar às páginas de autenticação
    const pathname = destino.split(/[?#]/)[0];

    if (["/login", "/cadastro", "/auth/google"].includes(pathname)) {
        redirect("/");
    }

    redirect(destino);
}