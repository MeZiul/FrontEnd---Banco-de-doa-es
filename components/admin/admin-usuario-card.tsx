"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suspenderUsuario, reativarUsuario, inativarUsuario } from "@/app/(protected)/admin/usuarios/actions"; // ajuste o caminho
import type { AdminUsuario, ResultadoAcao } from "@/app/(protected)/admin/usuarios/actions";

interface Props {
    usuario: AdminUsuario;
}

type Acao =
    | { tipo: "suspender"; justificativa: string; suspensaoAte: string | null }
    | { tipo: "reativar" }
    | { tipo: "inativar" };

const statusStyle = {
    ATIVO: "bg-green-100 text-green-600",
    SUSPENSO: "bg-red-100 text-red-600",
    INATIVO: "bg-gray-100 text-gray-600",
};

export default function UsuarioCard({ usuario }: Props) {
    const queryClient = useQueryClient();
    const [justificativa, setJustificativa] = useState("");
    const [suspendendo, setSuspendendo] = useState(false);
    const [suspensaoAte, setSuspensaoAte] = useState(""); // "YYYY-MM-DD"
    const [dataMinimaSuspensao] = useState(() => {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);

        return [
            amanha.getFullYear(),
            String(amanha.getMonth() + 1).padStart(2, "0"),
            String(amanha.getDate()).padStart(2, "0"),
        ].join("-");
    });

    const { mutate, isPending, error, reset } = useMutation({
        mutationFn: async (acao: Acao) => {
            let resultado: ResultadoAcao;

            if (acao.tipo === "suspender") {
                resultado = await suspenderUsuario(
                    usuario._id,
                    acao.justificativa,
                    acao.suspensaoAte
                );
            } else if (acao.tipo === "reativar") {
                resultado = await reativarUsuario(usuario._id);
            } else {
                resultado = await inativarUsuario(usuario._id);
            }

            if (!resultado.ok) throw new Error(resultado.erro);
        },
        onSuccess: async () => {
            setSuspendendo(false);
            setJustificativa("");
            setSuspensaoAte("");
            await queryClient.invalidateQueries({ queryKey: ["adminUsuarios"] });
        },
    });

    function confirmarSuspensao() {
        if (!justificativa.trim()) return;

        // Suspende até o fim do dia escolhido, no fuso do navegador.
        const ate = suspensaoAte
            ? new Date(`${suspensaoAte}T23:59:59`).toISOString()
            : null;

        mutate({ tipo: "suspender", justificativa, suspensaoAte: ate });
    }

    function executarSimples(tipo: "reativar" | "inativar") {
        const verbo = tipo === "reativar" ? "Reativar" : "Inativar";
        if (!window.confirm(`${verbo} ${usuario.nome}?`)) return;
        mutate({ tipo });
    }

    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-semibold">{usuario.nome}</h2>

                    <p className="text-sm text-gray-500">
                        {usuario.email} · {usuario.cidade} - {usuario.uf} ·{" "}
                        {usuario.perfil === "USUARIO" ? "Usuário" : usuario.perfil}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold 
                        ${statusStyle[usuario.situacao as keyof typeof statusStyle] ?? "bg-gray-100 text-gray-600"}`}
                >
                    {usuario.situacao}
                </span>
            </div>

            {suspendendo ? (
                <div className="mt-3 flex flex-col gap-2">
                    <textarea
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        placeholder="Justificativa da suspensão (obrigatória)"
                        rows={3}
                        className="w-full rounded-xl border p-2 text-sm"
                        disabled={isPending}
                    />
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        Suspenso até (opcional)
                        <input
                            type="date"
                            value={suspensaoAte}
                            min={dataMinimaSuspensao}
                            onChange={(e) => setSuspensaoAte(e.target.value)}
                            disabled={isPending}
                            className="w-48 rounded-xl border p-2 text-sm"
                        />
                        <span className="text-xs text-gray-400">
                            Deixe em branco para suspender sem prazo.
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <button
                            disabled={isPending || !justificativa.trim()}
                            onClick={confirmarSuspensao}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            Confirmar suspensão
                        </button>
                        <button
                            disabled={isPending}
                            onClick={() => {
                                setSuspendendo(false);
                                setJustificativa("");
                                setSuspensaoAte("");
                                reset();
                            }}
                            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 flex gap-2">
                    {usuario.situacao === "ATIVO" && (
                        <button
                            disabled={isPending}
                            onClick={() => setSuspendendo(true)}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            Suspender
                        </button>
                    )}

                    {usuario.situacao === "SUSPENSO" && (
                        <button
                            disabled={isPending}
                            onClick={() => executarSimples("reativar")}
                            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                        >
                            Reativar
                        </button>
                    )}

                    {usuario.situacao !== "INATIVO" && (
                        <button
                            disabled={isPending}
                            onClick={() => executarSimples("inativar")}
                            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                        >
                            Inativar
                        </button>
                    )}
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-500">{error.message}</p>
            )}
        </div>
    );
}