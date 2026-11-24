"use client";

import AuditoriaCard from "@/components/admin/admin-auditoria-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates, parseAsInteger } from "nuqs";
import { BarraFiltros } from "@/components/shared/barra-filtros";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";
import { useFiltrosUrl } from "@/hooks/use-filtros-url";
import { FILTROS_AUDITORIA } from "@/lib/admin-filtros";
import { buscarAuditorias } from "./actions";

export default function AdminAuditoriaPage() {
    const [{ pagina, limit }, setQuery] = useQueryStates({
        pagina: parseAsInteger.withDefault(1),
        limit: parseAsInteger.withDefault(10),
    });

    const filtros = useFiltrosUrl(FILTROS_AUDITORIA);

    const { data, isPending, isError, refetch } = useQuery({
        queryKey: ["admin", "auditoria", pagina, limit, filtros],
        queryFn: () => buscarAuditorias(pagina, limit, filtros),
    });

    const dados = data?.docs ?? [];

    // Atualiza limite e página juntos, numa única mudança de URL.
    function alterarLimite(novoLimite: number) {
        setQuery({ limit: novoLimite, pagina: 1 });
    }

    return (
        <div className="space-y-6">
            <Card className="w-full rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="space-y-2 p-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#001f3f]">
                        <ShieldCheck className="h-5 w-5 stroke-[2.5px] text-blue-600" />

                        Administração
                    </CardTitle>

                    <CardDescription className="text-sm font-medium text-slate-500 sm:text-base">
                        Gestão de contas, moderação de anúncios e resolução de denúncias. Toda ação exige justificativa e fica registrada na trilha de auditoria.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="w-full rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="p-5 sm:p-6">
                    <CardTitle className="text-xl font-bold text-[#001f3f]">
                        Trilha de auditoria
                    </CardTitle>

                    {data && (
                        <CardDescription>
                            {data.totalDocs} registro(s) encontrado(s).
                        </CardDescription>
                    )}
                </CardHeader>

                <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                    <BarraFiltros campos={FILTROS_AUDITORIA} id="filtros-auditoria" />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <label
                            htmlFor="limite-auditoria"
                            className="text-sm text-slate-600"
                        >
                            Registros por página:
                        </label>

                        <select
                            id="limite-auditoria"
                            value={limit}
                            onChange={(event) =>
                                alterarLimite(Number(event.target.value))
                            }
                            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {isPending && (
                        <p className="text-sm text-slate-500">
                            Carregando registros de auditoria...
                        </p>
                    )}

                    {isError && (
                        <div role="alert" className="space-y-2 text-sm text-red-600">
                          <p>
                            Não foi possível carregar os registros de auditoria.
                          </p>
                          <button type="button" onClick={() => refetch()} className="rounded-md border px-4 py-2 text-blue-800">Tentar novamente</button>
                        </div>
                    )}

                    {!isPending && !isError && dados.length === 0 && (
                        <p className="text-sm text-slate-500">
                            Nenhum registro de auditoria encontrado.
                        </p>
                    )}

                    {!isError && dados.map((auditoria) => (
                        <AuditoriaCard
                            key={auditoria._id}
                            auditoria={auditoria}
                        />
                    ))}

                    {data && data.totalPages > 1 && (
                        <div className="border-t pt-4">
                            <PaginacaoLinks
                                pagina={pagina}
                                totalPaginas={data.totalPages}
                                caminho="/admin/auditoria"
                                parametro="pagina"
                                rotulo="Paginação da auditoria"
                                extras={{ limit: String(limit), ...filtros }}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}