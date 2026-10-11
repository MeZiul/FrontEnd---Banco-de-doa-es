"use client";

import type { AdminDenuncia } from "@/app/(protected)/admin/denuncias/actions";
import { useState } from "react";
import AdminDenunciaResolver from "./admin-denuncia-resolver";

interface Props {
    denuncia: AdminDenuncia;
}

export default function AdminDenunciaCard({ denuncia }: Props) {
    const denunciado = denuncia.tipo_alvo === "ITEM" ? denuncia.alvo_item_id?.titulo ?? "Item não encontrado" : denuncia.alvo_usuario_id?.nome ?? "Usuário não encontrado";

    const tipo = denuncia.tipo_alvo === "ITEM" ? "Item" : "Usuário";

    const dataFormatada = new Date(denuncia.data_denuncia).toLocaleDateString("pt-BR");

    const statusLabel: Record<string, string> = {
        EM_ANALISE: "Em análise",
        PROCEDENTE: "Procedente",
        IMPROCEDENTE: "Improcedente",
    };

    const [resolvendo, setResolvendo] = useState(false);

    return (
        <article className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="text-xs text-muted-foreground">
                        Denúncia de {tipo}
                    </p>

                    <h3 className="font-semibold">
                        {denunciado}
                    </h3>
                </div>

                <span className="rounded-full border px-3 py-1 text-sm">
                    {statusLabel[denuncia.status] ?? denuncia.status}
                </span>
            </div>

            <div className="space-y-1 text-sm">
                <p>
                    <strong>Denunciante:</strong>{" "}
                    {denuncia.denunciante_id.nome}
                </p>

                <p>
                    <strong>Motivo:</strong> {denuncia.motivo}
                </p>

                <p>
                    <strong>Descrição:</strong> {denuncia.descricao}
                </p>

                <p>
                    <strong>Data:</strong> {dataFormatada}
                </p>
            </div>

            {denuncia.resposta_admin && (
                <p className="text-sm">
                    <strong>Resposta administrativa:</strong>{" "}
                    {denuncia.resposta_admin}
                </p>
            )}

            {denuncia.acao_tomada && (
                <p className="text-sm">
                    <strong>Ação tomada:</strong>{" "}
                    {denuncia.acao_tomada}
                </p>
            )}
            
            {denuncia.status === "EM_ANALISE" && (
                <button
                    type="button"
                    onClick={() => setResolvendo((atual) => !atual)}
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                    {resolvendo ? "Fechar resolução" : "Analisar denúncia"}
                </button>
            )}

            {resolvendo && denuncia.status === "EM_ANALISE" && (
                <AdminDenunciaResolver
                    denuncia={denuncia}
                    aoCancelar={() => setResolvendo(false)}
                    aoResolver={() => setResolvendo(false)}
                />
            )}
        </article>
    );
}
