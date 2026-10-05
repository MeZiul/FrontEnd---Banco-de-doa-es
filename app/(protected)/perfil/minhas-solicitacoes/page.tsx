"use client";

import { Clock, CheckCircle2, XCircle, User, Calendar, MessageCircle } from "lucide-react";

// Mock de dados com solicitações reais em diferentes estados
const mockSolicitacoes = [
  {
    id: 1,
    itemTitulo: "Geladeira duplex funcionando",
    doadorNome: "Marcos Ribeiro",
    status: "Aguardando aprovação",
    data: "22 Set 2026",
    imagem: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 2,
    itemTitulo: "Sofá 3 lugares em tecido cinza",
    doadorNome: "Ana Silva",
    status: "Aceito",
    data: "20 Set 2026",
    imagem: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 3,
    itemTitulo: "Cesta de alimentos não perecíveis",
    doadorNome: "Igreja Nova Esperança",
    status: "Recusado",
    data: "15 Set 2026",
    imagem: "https://images.unsplash.com/photo-1599552874136-11f8e17b8f95?auto=format&fit=crop&q=80&w=200",
  }
];

// Função para definir o estilo e ícone da tag baseado no status
const getStatusInfo = (status: string) => {
  switch (status) {
    case "Aguardando aprovação":
      return { className: "bg-yellow-100 text-yellow-700", Icon: Clock };
    case "Aceito":
      return { className: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 };
    case "Recusado":
      return { className: "bg-red-100 text-red-700", Icon: XCircle };
    default:
      return { className: "bg-gray-100 text-gray-700", Icon: Clock };
  }
};

export default function MinhasSolicitacoes() {
  return (
    <div className="w-full">
      {/* Cabeçalho da Página mantendo o texto da referência */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h1>
        <p className="text-slate-500 mt-1">Doações nas quais você demonstrou interesse.</p>
      </div>

      {/* Renderização Condicional: Se não houvesse dados, mostraria o empty state da imagem. 
          Como temos o mock, renderiza a lista. */}
      {mockSolicitacoes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          Você ainda não solicitou nenhuma doação.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {mockSolicitacoes.map((solicitacao) => {
            const StatusData = getStatusInfo(solicitacao.status);
            const StatusIcon = StatusData.Icon;

            return (
              <div 
                key={solicitacao.id} 
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                {/* Imagem do Item */}
                <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-50">
                  <img 
                    src={solicitacao.imagem} 
                    alt={solicitacao.itemTitulo} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Informações da Solicitação */}
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1">
                    {solicitacao.itemTitulo}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-gray-400" />
                      Doador: <span className="font-medium text-gray-700">{solicitacao.doadorNome}</span>
                    </span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {solicitacao.data}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between flex-wrap gap-3">
                    {/* Badge de Status */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${StatusData.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {solicitacao.status}
                    </span>

                    {/* Botão de Ação (Aparece apenas se a solicitação foi aceita) */}
                    {solicitacao.status === "Aceito" && (
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