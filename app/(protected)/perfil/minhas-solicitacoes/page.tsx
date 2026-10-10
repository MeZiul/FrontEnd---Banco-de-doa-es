import { Clock, CheckCircle2, XCircle, Ban, User, Calendar, MapPin, MessageCircle, Package } from "lucide-react";
import { fetchApiAutenticado } from "@/lib/auth-server";
import type { Paginado } from "@/types/api";
import type { Solicitacao, StatusSolicitacao } from "@/types/solicitacao";

// Texto, estilo e ícone da tag de cada status da API
const statusInfo: Record<StatusSolicitacao, { label: string; className: string; Icon: typeof Clock }> = {
  PENDENTE: { label: "Aguardando aprovação", className: "bg-yellow-100 text-yellow-700", Icon: Clock },
  ACEITO: { label: "Aceito", className: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 },
  RECUSADO: { label: "Recusado", className: "bg-red-100 text-red-700", Icon: XCircle },
  CANCELADO: { label: "Cancelado", className: "bg-gray-100 text-gray-600", Icon: Ban },
  EXPIRADO: { label: "Expirado", className: "bg-gray-100 text-gray-600", Icon: Clock },
};

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function MinhasSolicitacoes() {
  // GET /interesses devolve só as solicitações feitas pelo usuário logado
  const { docs: solicitacoes } = await fetchApiAutenticado<Paginado<Solicitacao>>("interesses", {
    params: { limit: 100 },
  });

  return (
    <div className="w-full">
      {/* Cabeçalho da Página mantendo o texto da referência */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h1>
        <p className="text-slate-500 mt-1">Doações nas quais você demonstrou interesse.</p>
      </div>

      {solicitacoes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          Você ainda não solicitou nenhuma doação.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {solicitacoes.map((solicitacao) => {
            const StatusData = statusInfo[solicitacao.status];
            const StatusIcon = StatusData.Icon;

            return (
              <div 
                key={solicitacao._id} 
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                {/* Imagem do Item */}
                <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-50 flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-300" />
                </div>

                {/* Informações da Solicitação */}
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1">
                    {solicitacao.item_id.titulo}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-gray-400" />
                      Doador: <span className="font-medium text-gray-700">{solicitacao.usuario_doador_id.nome}</span>
                    </span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatarData(solicitacao.data_interesse)}
                    </span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {solicitacao.item_id.cidade}/{solicitacao.item_id.uf}
                    </span>
                  </div>

                  {/* Resposta do Doador */}
                  {solicitacao.resposta_doador && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Resposta do doador:</span> {solicitacao.resposta_doador}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between flex-wrap gap-3">
                    {/* Badge de Status */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${StatusData.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {StatusData.label}
                    </span>

                    {/* Botão de Ação (Aparece apenas se a solicitação foi aceita) */}
                    {solicitacao.status === "ACEITO" && (
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        Combinar Retirada
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}