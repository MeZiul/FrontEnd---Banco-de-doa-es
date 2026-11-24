"use server";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { FILTROS_AUDITORIA, filtrosValidos } from "@/lib/admin-filtros";
import type { AdminAuditoria } from "@/types/admin-auditoria";
export type { AdminAuditoria } from "@/types/admin-auditoria";
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
export async function buscarAuditorias(pagina = 1, limit = 10, filtros: Record<string, unknown> = {}): Promise<RespostaAuditorias> {
    if (!Number.isSafeInteger(pagina) || pagina < 1) throw new Error("Página inválida.");
    if (![5, 10, 20, 50].includes(limit)) throw new Error("Limite inválido.");
    return fetchApiAutenticado<RespostaAuditorias>("admin/administracoes", {
        // Argumento de Server Action vem do navegador: só passam filtros conhecidos.
        params: { page: pagina, limit, ...filtrosValidos(FILTROS_AUDITORIA, filtros) },
        signal: AbortSignal.timeout(10000),
    });
}