import { MessageCircle, Phone } from "lucide-react";

type ContatoWhatsAppProps = {
    telefone?: string | null;
    nome: string;
};

export function ContatoWhatsApp({
    telefone,
    nome
}: ContatoWhatsAppProps) {
    if (!telefone?.trim()) return null;

    const numero = telefone.replace(/\D/g, "");

    const numeroWhatsApp = numero.length === 10 || numero.length === 11
        ? `55${numero}`
        : numero;

    const numeroValido = /^55\d{10,11}$/.test(numeroWhatsApp);

    return (
        <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>
                    Telefone de {nome}:{" "}
                    <strong>{telefone}</strong>
                </span>
            </span>

            {numeroValido && (
                <a
                    href={`https://wa.me/${numeroWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Conversar no WhatsApp
                </a>
            )}
        </div>
    );
}
