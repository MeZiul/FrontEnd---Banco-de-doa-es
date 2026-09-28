"use client";

import AuditoriaCard from "@/components/AdminAuditoriaCard";
import { Card, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

interface AdminAuditoria {
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

export default function AdminAuditoriaPage() {
    const [dados, setDados] = useState<AdminAuditoria[]>([
        {
            _id: "507f1f77bcf86cd799439017",
            administrador_id: {
                _id: "507f1f77bcf86cd799439012",
                nome: "Usuário Moderado",
                email: "usuario@email.com",
                perfil: "USUARIO",
                situacao: "ATIVO",
            },
            tipo_acao: "BLOQUEIO_USUARIO",
            tipo_alvo: "USUARIO",
            alvo_id: {
                _id: "507f1f77bcf86cd799439012",
                nome: "Usuário Moderado",
                email: "usuario@email.com",
                perfil: "USUARIO",
                situacao: "ATIVO",
            },
            alvo_model: "Usuario",
            justificativa:
                "Violação reiterada das regras da plataforma.",
            suspensao_ate:
                "2026-09-20T04:04:50.103Z",
            resultado_denuncia: "PROCEDENTE",
            resposta_administrativa:
                "Conta suspensa após análise.",
            acao_tomada:
                "Usuário suspenso.",
            data_acao:
                "2026-09-20T04:04:50.103Z",
            createdAt:
                "2026-09-20T04:04:50.103Z",
            updatedAt:
                "2026-09-20T04:04:50.103Z",
        }, {
            _id: "507f1f77bcf86cd799439018",
            administrador_id: {
                _id: "507f1f77bcf86cd799439013",
                nome: "Administrador Doaí",
                email: "admin@doai.com",
                perfil: "ADMIN",
                situacao: "ATIVO",
            },
            tipo_acao: "REJEICAO_DENUNCIA",
            tipo_alvo: "DENUNCIA",
            alvo_id: {
                _id: "507f1f77bcf86cd799439014",
                nome: "Sofá 3 lugares em tecido cinza",
                email: "anuncio@doai.com",
                perfil: "USUARIO",
                situacao: "ATIVO",
            },
            alvo_model: "Denuncia",
            justificativa: "Após análise, não foram identificadas violações das regras da plataforma.",
            suspensao_ate: null,
            resultado_denuncia: "IMPROCEDENTE",
            resposta_administrativa: "Denúncia rejeitada após análise.",
            acao_tomada: "Nenhuma ação aplicada ao usuário.",
            data_acao: "2026-09-18T15:30:00.000Z",
            createdAt: "2026-09-18T15:30:00.000Z",
            updatedAt: "2026-09-18T15:30:00.000Z",
        }, {
            _id: "507f1f77bcf86cd799439019",
            administrador_id: {
                _id: "507f1f77bcf86cd799439015",
                nome: "Administrador Doaí",
                email: "admin@doai.com",
                perfil: "ADMIN",
                situacao: "ATIVO",
            },
            tipo_acao: "INATIVACAO_USUARIO",
            tipo_alvo: "USUARIO",
            alvo_id: {
                _id: "507f1f77bcf86cd799439016",
                nome: "Lucas Ferreira",
                email: "lucas@email.com",
                perfil: "USUARIO",
                situacao: "INATIVO",
            },
            alvo_model: "Usuario",
            justificativa: "Solicitação de exclusão de conta realizada pelo próprio usuário.",
            suspensao_ate: null,
            resultado_denuncia: null,
            resposta_administrativa: "Solicitação de exclusão processada.",
            acao_tomada: "Conta do usuário inativada.",
            data_acao: "2026-09-15T10:20:00.000Z",
            createdAt: "2026-09-15T10:20:00.000Z",
            updatedAt: "2026-09-15T10:20:00.000Z",
        },
    ]);

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

            <div>
                <Card className="w-full rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-5 sm:p-6">
                        <CardTitle className="text-xl font-bold text-[#001f3f]">
                            Trilha de auditoria
                        </CardTitle>
                    </CardHeader>

                    <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                        {dados.map((auditoria) => (
                            <AuditoriaCard
                                key={auditoria._id}
                                auditoria={auditoria}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}