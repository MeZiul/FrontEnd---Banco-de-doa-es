"use server";

import { fetchApiAutenticado } from "@/lib/auth-server";

export interface UsuarioDenuncia {
    _id: string;
    nome: string;
    email: string;
    cidade?: string;
    uf?: string;
    situacao?: string;
}

export interface ItemDenuncia {
    _id: string;
    titulo: string;
    status: string;
    cidade?: string;
    uf?: string;
    usuario_id: string;
}

export interface AdminDenuncia {
    _id: string;
    denunciante_id: UsuarioDenuncia;
    tipo_alvo: "ITEM" | "USUARIO";
    alvo_item_id: ItemDenuncia | null;
    alvo_usuario_id: UsuarioDenuncia | null;
    motivo: string;
    descricao: string;
    status: "EM_ANALISE" | "PROCEDENTE" | "IMPROCEDENTE";
    resposta_admin: string | null;
    admin_id: UsuarioDenuncia | null;
    acao_tomada: string | null;
    data_denuncia: string;
    data_analise: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DadosPaginados<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

interface RespostaApi<T> {
    message: string;
    data: T;
    errors: unknown[];
}

export interface DadosResolucaoDenuncia {
    resultado_denuncia: "PROCEDENTE" | "IMPROCEDENTE";
    resposta_admin: string;
    acao_tomada: string;
}

const LIMITES_PERMITIDOS = [5, 10, 20, 50];

export async function listarDenunciasAction(
    pagina: number,
    limit: number,
): Promise<DadosPaginados<AdminDenuncia>> {
    if (!Number.isSafeInteger(pagina) || pagina < 1) throw new Error("Página inválida.");

    if (!LIMITES_PERMITIDOS.includes(limit)) throw new Error("Limite de registros inválido.");

    const resposta = await fetchApiAutenticado<RespostaApi<DadosPaginados<AdminDenuncia>> | DadosPaginados<AdminDenuncia>>(
        "admin/denuncias",
        {
            params: {
                page: pagina,
                limit,
            },
        },
    );

    if ("docs" in resposta) return resposta;

    if (resposta.data?.docs) return resposta.data;

    throw new Error("Formato inesperado na resposta de denúncias.");
}

export async function resolverDenunciaAction(
    id: string,
    dados: DadosResolucaoDenuncia,
) {
    if (!id) throw new Error("Identificador da denúncia não informado.");
    if (!dados.resposta_admin.trim()) throw new Error("Informe a resposta administrativa.");

    const { fetchApiAutenticado } = await import("@/lib/auth-server");

    return fetchApiAutenticado(`admin/denuncias/${id}/resolver`, {
        metodo: "PUT",
        body: {
            resultado_denuncia: dados.resultado_denuncia,
            resposta_admin: dados.resposta_admin.trim(),
            acao_tomada: dados.acao_tomada.trim() || null,
        },
    },
    );
}
