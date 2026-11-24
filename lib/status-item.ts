import type { StatusItem } from "@/types/item-doacao";

export const STATUS_ITEM: Record<StatusItem, { nome: string; classe: string }> = {
    DISPONIVEL: { nome: "Disponível", classe: "bg-blue-50 text-blue-700" },
    RESERVADO: { nome: "Reservado", classe: "bg-emerald-100 text-emerald-800" },
    AGUARDANDO_CONFIRMACAO: { nome: "Aguardando confirmação", classe: "bg-yellow-100 text-yellow-800" },
    DOADO: { nome: "Doado", classe: "bg-gray-100 text-gray-700" },
    CANCELADO: { nome: "Cancelado", classe: "bg-red-50 text-red-700" },
};
