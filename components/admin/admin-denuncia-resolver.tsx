"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { resolverDenunciaAction } from "@/app/(protected)/admin/denuncias/actions";
import { type AdminDenuncia } from "@/app/(protected)/admin/denuncias/actions";

interface Props {
    denuncia: AdminDenuncia;
    aoCancelar: () => void;
    aoResolver: () => void;
}

export default function AdminDenunciaResolver({
    denuncia,
    aoCancelar,
    aoResolver,
}: Props) {
    const queryClient = useQueryClient();

    const [resultado, setResultado] = useState<"PROCEDENTE" | "IMPROCEDENTE">("PROCEDENTE");

    const [resposta, setResposta] = useState(denuncia.resposta_admin ?? "");

    const [acao, setAcao] = useState(denuncia.acao_tomada ?? "");

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    async function enviarResolucao() {
        setErro("");
        setSalvando(true);

        try {
            await resolverDenunciaAction(denuncia._id, {
                resultado_denuncia: resultado,
                resposta_admin: resposta,
                acao_tomada: acao,
            });

            await queryClient.invalidateQueries({
                queryKey: ["admin", "denuncias"],
            });

            aoResolver();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível resolver a denúncia.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">
                Resolver denúncia
            </h3>

            <div className="space-y-2">
                <label
                    htmlFor={`resultado-${denuncia._id}`}
                    className="text-sm font-medium"
                >
                    Resultado da análise
                </label>

                <select
                    id={`resultado-${denuncia._id}`}
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value as | "PROCEDENTE" | "IMPROCEDENTE")}
                    className="w-full rounded-md border bg-background p-2"
                >
                    <option value="PROCEDENTE">
                        Procedente
                    </option>
                    <option value="IMPROCEDENTE">
                        Improcedente
                    </option>
                </select>
            </div>

            <div className="space-y-2">
                <label
                    htmlFor={`resposta-${denuncia._id}`}
                    className="text-sm font-medium"
                >
                    Resposta administrativa
                </label>

                <textarea
                    id={`resposta-${denuncia._id}`}
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    maxLength={1000}
                    required
                    rows={3}
                    className="w-full rounded-md border bg-background p-3"
                    placeholder="Explique a decisão tomada..."
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor={`acao-${denuncia._id}`}
                    className="text-sm font-medium"
                >
                    Ação tomada
                </label>

                <textarea
                    id={`acao-${denuncia._id}`}
                    value={acao}
                    onChange={(e) => setAcao(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="w-full rounded-md border bg-background p-3"
                    placeholder="Descreva a medida adotada, se houver."
                />
            </div>

            {erro && (
                <p className="text-sm text-destructive">
                    {erro}
                </p>
            )}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={aoCancelar}
                    disabled={salvando}
                    className="rounded-md border px-4 py-2 text-sm"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={enviarResolucao}
                    disabled={salvando || !resposta.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                >
                    {salvando ? "Salvando..." : "Confirmar resolução"}
                </button>
            </div>
        </section>
    );
}
