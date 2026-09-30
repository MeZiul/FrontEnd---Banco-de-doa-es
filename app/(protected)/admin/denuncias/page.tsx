"use client";

import AdminDenunciaCard from "@/components/AdminDenunciaCard";
import { AdminCardHeader } from "@/components/ui/AdminCardHeader";
import { useState } from "react";

interface AdminDenuncias {
    _id: string;
    tag: string;
    denunciado: string;
    tipo: string;
    denunciante: string;
    descricao: string;
    situacao: string;
    data_denuncia: string;
}

export default function AdminDenunciasPage() {
    const [dados, setDados] = useState<AdminDenuncias[]>([
        {
            "_id": "1",
            "tag": "Item",
            "denunciado": "Geladeira duplex funcionando",
            "tipo": "Cobrança pelo item",
            "denunciante": "Marcos Ribeiro",
            "descricao": "O doador pediu R$150 pela retirada do item.",
            "situacao": "EM_ANALISE",
            "data_denuncia": "2026-09-06T12:22:145Z"
        },
        {
            "_id": "2",
            "tag": "Usuario",
            "denunciado": "Carlos Eduardo",
            "tipo": "Fraude ou golpe",
            "denunciante": "igreja Nova Esperança",
            "descricao": "Marcou retirada três vezes e nunca apareceu.",
            "situacao": "EM_ANALISE",
            "data_denuncia": "2026-09-06T12:22:145Z"
        },
        {
            "_id": "3",
            "tag": "Item",
            "denunciado": "Sofá 3 lugares em tecido cinza",
            "tipo": "Spam ou anuncio repetido",
            "denunciante": "Lucas Ferreira",
            "descricao": "O mesmo anúncio foi postado várias vezes.",
            "situacao": "REJEITADO",
            "data_denuncia": "2026-09-06T12:22:145Z"
        }
    ]);

    return (
        <div className="space-y-6">
            <AdminCardHeader />
            <div className="space-y-3">
                {dados.map((denuncia) => (
                    <AdminDenunciaCard key={denuncia._id} denuncia={denuncia} />
                ))}
            </div>
        </div>
    );
}