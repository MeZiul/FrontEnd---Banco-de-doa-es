"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";

import AdminDenunciaCard from "@/components/admin/admin-denuncia-card";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import { BarraFiltros } from "@/components/shared/barra-filtros";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";
import { useFiltrosUrl } from "@/hooks/use-filtros-url";
import { FILTROS_DENUNCIAS } from "@/lib/admin-filtros";

import { listarDenunciasAction } from "./actions";

export default function AdminDenunciasPage() {
    const [{ pagina, limit }, setQuery] = useQueryStates({
        pagina: parseAsInteger.withDefault(1),
        limit: parseAsInteger.withDefault(20),
    });

    const filtros = useFiltrosUrl(FILTROS_DENUNCIAS);

    const { data, isPending, isError, error } = useQuery({
        queryKey: ["admin", "denuncias", pagina, limit, filtros],
        queryFn: () => listarDenunciasAction(pagina, limit, filtros),
    });

    const denuncias = data?.docs ?? [];

    return (
        <div className="space-y-6">
            <AdminCardHeader />
            <BarraFiltros campos={FILTROS_DENUNCIAS} id="filtros-denuncias" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {data ? `${data.totalDocs} denúncias encontradas` : "Carregando total de denúncias..."}
                </p>

                <div className="flex items-center gap-2">
                    <label htmlFor="limite-denuncias" className="text-sm">
                        Por página:
                    </label>

                    <select
                        id="limite-denuncias"
                        value={limit}
                        onChange={(event) => setQuery({ limit: Number(event.target.value), pagina: 1 })}
                        className="rounded-md border bg-background px-3 py-2 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {isPending && (
                <p className="text-sm text-muted-foreground">
                    Carregando denúncias...
                </p>
            )}

            {isError && (
                <p className="text-sm text-destructive">
                    Erro ao carregar denúncias: {error.message}
                </p>
            )}

            {!isPending && !isError && denuncias.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Nenhuma denúncia encontrada.
                </p>
            )}

            {!isError && (
                <div className="space-y-3">
                    {denuncias.map((denuncia) => (
                        <AdminDenunciaCard
                            key={denuncia._id}
                            denuncia={denuncia}
                        />
                    ))}
                </div>
            )}

            {data && (
                <PaginacaoLinks
                    pagina={pagina}
                    totalPaginas={data.totalPages}
                    caminho="/admin/denuncias"
                    parametro="pagina"
                    rotulo="Paginação das denúncias"
                    extras={{ limit: String(limit), ...filtros }}
                />
            )}
        </div>
    );
}