"use server";

import { fetchApiAutenticado } from "@/lib/auth-server";

export interface AdminAuditoria {
    _id: string;
    administrador_id: {
        _id: string;
        nome: string;
        email: string;
        perfil: string;
        situacao: string;
    };
    tipo_acao: string;
    tipo_alvo: string;
    alvo_id: {
        _id: string;
        nome: string;
        email: string;
        perfil: string;
        situacao: string;
    };
    alvo_model: string;
    justificativa: string;
    suspensao_ate: string | null;
    resultado_denuncia: string | null;
    resposta_administrativa: string | null;
    acao_tomada: string | null;
    data_acao: string;
    createdAt: string;
    updatedAt: string;
}

export interface RespostaAuditorias {
    docs: AdminAuditoria[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export async function buscarAuditorias(
    pagina = 1,
    limit = 10,
): Promise<RespostaAuditorias> {
    const resposta =
        await fetchApiAutenticado<RespostaAuditorias>(
            "admin/administracoes",
            {
                params: {
                    pagina,
                    limit,
                },
            },
        );

    return resposta;
}