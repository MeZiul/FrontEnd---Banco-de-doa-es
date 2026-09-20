"use client";

import AuditoriaCard from "@/components/AdminAuditoriaCard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

interface AdminAuditoria {
    id: number;
    titulo: string;
    alvo: string;
    responsavel: string;
    justificativa: string;
    data: string;
}

export default function adminAuditoriaPage() {
    const [dados, setDados] = useState<AdminAuditoria[]>([
        {
            "id": 1,
            "titulo": 'Usuário suspenso',
            "alvo": "Carlos Eduardo",
            "responsavel": "Equipe Doaí",
            "justificativa": "Anúncio com item impróprio para uso",
            "data": "2026-08-30T12:22:00.145Z",
        },
        {
            "id": 2,
            "titulo": "Denúncia rejeitada",
            "alvo": "Sofá 3 lugares em tecido cinza",
            "responsavel": "Equipe Doaí",
            "justificativa": "Anúncio único, denúncia sem fundamento",
            "data": "2026-08-25T12:22:00.145Z",
        },
        {
            "id": 3,
            "titulo": "Usuário inativado",
            "alvo": "Lucas Ferreira",
            "responsavel": "Equipe Doai",
            "justificativa": "Pedido de exclusão de conta pelo próprio usuário",
            "data": "2026-08-09T12:22:00.145Z",
        }
    ])
    return (
        <div className="space-y-6">
            <Card className="w-full rounded-2xl border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 sm:p-6 space-y-2">
                    <CardTitle className="flex items-center gap-2 text-[#001f3f] text-xl font-bold tracking-tight">
                        <ShieldCheck className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
                        Administração
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm sm:text-base font-medium">
                        Gestão de contas, moderação de anúncios e resolução de denúncias. Toda ação exige justificativa e fica registrada na trilha de auditoria.
                    </CardDescription>
                </CardHeader>
            </Card>
            <div>
                {/* Trilha de auditoria */}
                <Card className="w-full rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-5 sm:p-6">
                        <CardTitle className="text-xl font-bold text-[#001f3f]">
                            Trilha de auditoria
                        </CardTitle>
                    </CardHeader>

                    <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                        {dados.map((auditoria) => (
                            <AuditoriaCard
                                key={auditoria.id}
                                auditoria={auditoria}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}