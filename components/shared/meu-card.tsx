//components/ui/MeuCard.tsx
import Image from "next/image";
import { LucideIcon } from "lucide-react";

interface CardProps {
    titulo: string;
    imagem: string;
    icone: LucideIcon;
    tipoEntrega: string;
    endereco: string;
}

export default function MeuCard({
    titulo,
    imagem,
    icone: Icone,
    tipoEntrega,
    endereco,
}: CardProps) {
    return (
        <div className="w-full max-w-45">
            <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                    fill
                    loading="eager"
                    src={imagem}
                    alt={titulo}
                    className="object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            <h2 className="mt-2 text-sm font-bold leading-tight text-black">
                {titulo}
            </h2>
            <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-black">
                    <Icone size={20} strokeWidth={1.7} />
                    <span>{tipoEntrega}</span>
                </div>

                <p className="text-xs text-gray-400">
                    {endereco}
                </p>
            </div>
        </div>
    );
}