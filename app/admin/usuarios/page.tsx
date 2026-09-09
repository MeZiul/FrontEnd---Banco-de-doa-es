"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

interface AdminUsuarios {
    _id: string;
    nome: string;
    email: string;
    cidade: string;
    uf: string;
    perfil: string;
    situacao: string;
    media_avaliacoes: number;
    total_avaliacoes: number;
    total_doacoes: number;
    data_cadastro: string;
}

export default function adminUsuariosPage() {
    const [dados, setDados] = useState<AdminUsuarios[]>([
        {
            "_id": "80f12018-28f3-4103-b5c0-ce86fd8592ea",
            "nome": "Celsi Saraiva Braga",
            "email": "celsi.braga285@email.com",
            "cidade": "Campo Grande",
            "uf": "MS",
            "perfil": "USUARIO",
            "situacao": "ATIVO",
            "media_avaliacoes": 0,
            "total_avaliacoes": 0,
            "total_doacoes": 0,
            "data_cadastro": "2026-08-25T05:51:29.487Z",
        },
        {
            "_id": "3efffd5f-945a-4343-bfdf-1b34f86d2163",
            "nome": "Glaci Reis Costa",
            "email": "glaci.costa8585@email.com",
            "cidade": "Rio Branco",
            "uf": "AC",
            "perfil": "USUARIO",
            "situacao": "ATIVO",
            "media_avaliacoes": 0,
            "total_avaliacoes": 0,
            "total_doacoes": 0,
            "data_cadastro": "2026-08-25T05:51:29.483Z",
        },
        {
            "_id": "b47f66b1-e133-4b6d-85f3-0122599ad882",
            "nome": "Gabriel Nogueira Nogueira",
            "email": "gabriel.nogueira6276@email.com",
            "cidade": "Porto Velho",
            "uf": "RO",
            "perfil": "USUARIO",
            "situacao": "ATIVO",
            "media_avaliacoes": 0,
            "total_avaliacoes": 0,
            "total_doacoes": 0,
            "data_cadastro": "2026-08-25T05:51:29.482Z",
        }
    ]);
    return (
        <>
            <Card className="w-full max-w-5xl rounded-2xl border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 sm:p-6 space-y-2">
                    <CardTitle className="flex items-center gap-2 text-[#001f3f] text-xl font-bold tracking-tight">
                        <ShieldCheck className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
                        Administração
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm sm:text-base font-medium">
                        Gestão de contas, moderação de anúncios e resolução de denúncias. Toda ação exige justificativa e fica registrada na trilha de auditoria.
                    </CardDescription>
                </CardHeader>
            </Card></>
    )
}