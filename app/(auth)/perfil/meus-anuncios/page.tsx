"use client";

import { useState } from "react";
import { MoreHorizontal, Users, Pencil, CheckCircle2, Package, XCircle } from "lucide-react";

// Mock de dados baseado na imagem de referência
const mockAnuncios = [
  {
    id: 1,
    titulo: "Caixa com roupas infantis (2 a 6 anos)",
    status: "Aguardando ação",
    interessados: 3,
    imagem: "https://images.unsplash.com/photo-1489987707023-afc152d1d454?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    titulo: "Mesa de estudos com cadeira",
    status: "Ativo",
    interessados: 0,
    imagem: "https://images.unsplash.com/photo-1595514535415-8123bf01314a?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    titulo: "Bicicleta infantil aro 16 com rodinhas",
    status: "Em andamento",
    interessados: 1,
    imagem: "https://images.unsplash.com/photo-1518623004386-8968988a032d?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    titulo: "Livros escolares e cadernos usados",
    status: "Concluído",
    interessados: 0,
    imagem: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
  },
];

// Função auxiliar para as cores exatas do layout
const getStatusStyles = (status: string) => {
  switch (status) {
    case "Aguardando ação": return "bg-yellow-100 text-yellow-700";
    case "Ativo": return "bg-blue-50 text-blue-600";
    case "Em andamento": return "bg-emerald-100 text-emerald-700";
    case "Concluído": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function MeusAnuncios() {
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  return (
    <div className="w-full relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Meus Anúncios</h1>
        <p className="text-slate-500 mt-1">Acompanhe as doações que você publicou.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAnuncios.map((item) => (
          <div key={item.id} className="bg-white rounded-[20px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative">
            
            {/* Imagem do Card com altura fixa */}
            <div className="h-48 w-full relative bg-gray-100 shrink-0">
              <img 
                src={item.imagem} 
                alt={item.titulo} 
                className="w-full h-full object-cover" 
              />
              
              {/* Botão de Menu */}
              <button 
                onClick={() => toggleMenu(item.id)}
                className="absolute top-3 right-3 h-8 w-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-20"
              >
                <MoreHorizontal className="h-5 w-5 text-gray-700" />
              </button>

              {/* Caixa do Menu Dropdown */}
              {menuAbertoId === item.id && (
                <div className="absolute top-12 right-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <Pencil className="h-4 w-4" /> Editar anúncio
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <Package className="h-4 w-4" /> Confirmar entrega
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <CheckCircle2 className="h-4 w-4" /> Confirmar recebimento
                  </button>
                  
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                  
                  <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                    <XCircle className="h-4 w-4" /> Cancelar doação
                  </button>
                </div>
              )}
            </div>

            {/* Conteúdo Abaixo da Imagem */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-[15px] leading-tight mb-4 min-h-[38px]">
                {item.titulo}
              </h3>
              
              <div className="mt-auto flex flex-col gap-3">
                <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles(item.status)}`}>
                  {item.status}
                </span>
                
                <div className="flex items-center text-[13px] text-gray-500 gap-1.5 font-medium">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{item.interessados} pessoa(s) interessada(s)</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
      
      {/* */}
      {menuAbertoId && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuAbertoId(null)}></div>
      )}
    </div>
  );
}
