"use client";

import UsuarioCard from "@/components/admin/admin-usuario-card";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import { listarUsuarios } from "./actions";
import type { AdminUsuario, RespostaPaginada } from "./actions";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";

import DataPagination from "@/components/ui/DataPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsuariosPage() {
    const [{ pagina, limit }, setPaginacao] = useQueryStates(
        {
            pagina: parseAsInteger.withDefault(1),
            limit: parseAsInteger.withDefault(5),
        },
        {
            history: "push",
            clearOnDefault: false,
        }
    );

    const { data, isPending, isError, error, isFetching } = useQuery<RespostaPaginada<AdminUsuario>>({
        queryKey: ["adminUsuarios", pagina, limit],
        queryFn: () => listarUsuarios(pagina, limit),
    });


    return (
        <div className="flex min-h-full flex-1 flex-col gap-5">
            <AdminCardHeader />

            {isPending && (
                <p className="text-muted-foreground">
                    Carregando usuários...
                </p>
            )}

            {isError && (
                <p className="text-red-500">
                    {error?.message || "Erro ao carregar usuários."}
                </p>
            )}

            {!isPending && !isError && (
                <>
                    {data?.docs.length === 0 ? (
                        <p className="text-muted-foreground">
                            Nenhum usuário encontrado.
                        </p>
                    ) : (
                        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`} >
                            {data?.docs.map((usuario) => (
                                <UsuarioCard
                                    key={usuario._id}
                                    usuario={usuario}
                                />
                            ))}
                        </div>
                    )}

                    <div className="relative flex shrink-0 flex-col items-center justify-center gap-3 border-t bg-[#F8FAFC] py-3 sm:flex-row">
                        <div className="flex items-center gap-2 sm:absolute sm:left-0">
                            <span className="text-sm text-muted-foreground">
                                Exibir
                            </span>

                            <Select
                                value={String(limit)}
                                onValueChange={(valor) =>
                                    void setPaginacao({ pagina: 1, limit: Number(valor), })
                                }
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {[5, 10, 20, 50].map((quantidade) => (
                                        <SelectItem
                                            key={quantidade}
                                            value={String(quantidade)}
                                        >
                                            {quantidade}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <span className="text-sm text-muted-foreground">
                                por página
                            </span>
                        </div>

                        <DataPagination
                            pagina={pagina}
                            totalPaginas={Math.max(1, data?.totalPages ?? 1)}
                            aoMudarPagina={(destino) => void setPaginacao({ pagina: destino })}
                        />
                    </div>

                </>
            )}
        </div>
    );

}
