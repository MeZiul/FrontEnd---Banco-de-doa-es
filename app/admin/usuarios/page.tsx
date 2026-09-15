"use client"

import UsuarioCard from "@/components/AdminUsuarioCard";
import { AdminCardHeader } from "@/components/ui/AdminCardHeader";
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
            "situacao": "SUSPENSO",
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
            "situacao": "INATIVO",
            "media_avaliacoes": 0,
            "total_avaliacoes": 0,
            "total_doacoes": 0,
            "data_cadastro": "2026-08-25T05:51:29.482Z",
        }
    ]);
    return (
        <div className="space-y-6">
            <AdminCardHeader />
            <div className="space-y-3">
                {dados.map((usuario) => (
                    <UsuarioCard key={usuario._id} usuario={usuario} />
                ))}
            </div>
        </div>
    )
}
