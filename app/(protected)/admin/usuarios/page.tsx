"use client";

import UsuarioCard from "@/components/admin/admin-usuario-card";
import { AdminCardHeader } from "@/components/admin/admin-card-header";
import { listarUsuarios } from "./actions";
import type { AdminUsuario, RespostaPaginada } from "./actions";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";

import DataPagination from "@/components/ui/DataPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const LIMITES_PERMITIDOS = [5, 10, 20, 50];

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

    // Evita consultar a API com uma página inválida.
    const paginaAtual = Number.isSafeInteger(pagina) && pagina >= 1 ? pagina : 1;
    const limiteAtual = LIMITES_PERMITIDOS.includes(limit) ? limit : 5;

    const { data, isPending, isError, error, isFetching } = useQuery<RespostaPaginada<AdminUsuario>>({
        queryKey: ["adminUsuarios", paginaAtual, limiteAtual],
        queryFn: () => listarUsuarios(paginaAtual, limiteAtual),
    });


    // Corrige os parâmetros inválidos da URL.
    useEffect(() => {
        if (pagina !== paginaAtual || limit !== limiteAtual) {
            setPaginacao({
                pagina: paginaAtual,
                limit: limiteAtual,
            });
        }
    }, [pagina, paginaAtual, limit, limiteAtual, setPaginacao]);

    // Se a página atual deixar de existir, retorna à última página válida.
    useEffect(() => {
        if (!data) return;

        const totalPaginas = Math.max(1, data.totalPages);

        if (paginaAtual > totalPaginas) {
            setPaginacao({ pagina: totalPaginas });
        }
    }, [data, paginaAtual, setPaginacao]);

    function mudarLimite(valor: string | null) {
        if (valor === null) return;

        const novoLimite = Number(valor);

        if (!LIMITES_PERMITIDOS.includes(novoLimite)) return;

        setPaginacao({
            pagina: 1,
            limit: novoLimite,
        });
    }

    // O DataPagination só oferece páginas que existem; basta ignorar a página atual.
    function mudarPagina(destino: number) {
        if (destino === paginaAtual) return;

        setPaginacao({ pagina: destino });
    }
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
                        <label
                            htmlFor="limite-usuarios"
                            className="text-sm text-muted-foreground"
                        >
                            Exibir
                        </label>


                            <Select
                                value={String(limiteAtual)}
                                onValueChange={mudarLimite}
                                disabled={isFetching}
                            >
                                <SelectTrigger
                                    id="limite-usuarios"
                                    className="w-20"
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {LIMITES_PERMITIDOS.map((quantidade) => (
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
                            pagina={paginaAtual}
                            totalPaginas={Math.max(1, data.totalPages)}
                            aoMudarPagina={mudarPagina}
                        />
                    </div>

                </>
            )}
        </div>
    );

}
