// app/itensDoacao/page.tsx
"use client";

import { useState } from "react";
import { DoorOpen, Truck, LucideIcon } from "lucide-react";
import MeuCard from "@/components/ui/MeuCard";

interface ItemDoacao {
    id: number;
    titulo: string;
    imagem: string;
    icone: LucideIcon;
    tipoEntrega: string;
    endereco: string;
}

export default function ItensDoacao() {
    const [dados, setDados] = useState<ItemDoacao[]>([
        {
            id: 1,
            titulo: "Mesa de madeira sem cadeiras",
            imagem: "/images/imagem1.jpg",
            icone: DoorOpen,
            tipoEntrega: "Retirada",
            endereco: "Vilhena/RO",
        },
        {
            id: 2,
            titulo: "Livros",
            imagem: "/images/imagem2.png",
            icone: Truck,
            tipoEntrega: "Envio",
            endereco: "Vilhena/RO",
        },
        {
            id: 3,
            titulo: "Suporte para monitor",
            imagem: "/images/imagem3.png",
            icone: Truck,
            tipoEntrega: "Envio",
            endereco: "Vilhena/RO",
        },
    ]);

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center gap-3">
                <span className="text-sm">
                    Ordenar por:
                </span>

                <button className="flex items-center gap-2 rounded-md bg-yellow-300 px-3 py-2 text-sm font-medium">
                    Próximos de mim

                    <span className="text-xs">
                        ⌄
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {dados.map((d) => (
                    <MeuCard
                        key={d.id}
                        titulo={d.titulo}
                        imagem={d.imagem}
                        icone={d.icone}
                        tipoEntrega={d.tipoEntrega}
                        endereco={d.endereco}
                    />
                ))}
            </div>
        </div>
    );
}