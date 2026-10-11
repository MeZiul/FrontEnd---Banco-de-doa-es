"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";

import AdminDenunciaCard from "@/components/admin/admin-denuncia-card";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import DataPagination from "@/components/ui/DataPagination";

import { listarDenunciasAction } from "./actions";

export default function AdminDenunciasPage() {
    const [{ pagina, limit }, setQuery] = useQueryStates({
        pagina: parseAsInteger.withDefault(1),
        limit: parseAsInteger.withDefault(20),
    });

    const { data, isPending, isError, error } = useQuery({
        queryKey: ["admin", "denuncias", pagina, limit],
        queryFn: () => listarDenunciasAction(pagina, limit),
    });

    const denuncias = data?.docs ?? [];

    return (
        <div className="space-y-6">
            <AdminCardHeader />

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
                        onChange={(event) => { void setQuery({ limit: Number(event.target.value), pagina: 1 }); }}
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

            {data && data.totalPages > 1 && (
                <DataPagination
                    pagina={pagina}
                    totalPaginas={data.totalPages}
                    aoMudarPagina={(novaPagina: number) => { void setQuery({ pagina: novaPagina }); }}
                />
            )}
        </div>
    );
}
