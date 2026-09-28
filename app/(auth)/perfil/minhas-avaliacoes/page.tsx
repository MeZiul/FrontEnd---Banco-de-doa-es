"use client";

import { Star, Pencil, Trash2 } from "lucide-react";

const mockAvaliacoes = [
  {
    id: 1,
    autor: "Patrícia Gomes",
    estrelas: 5,
    tempo: "há 5 dia(s)",
    texto: "Doadora super atenciosa, tudo certinho!",
    item: "Livros escolares e cadernos usados",
    editavel: true,
  },
  {
    id: 2,
    autor: "Lucas Ferreira",
    estrelas: 4,
    tempo: "há 20 dia(s)",
    texto: "Combinamos a retirada rapidinho. Recomendo.",
    item: "Mesa de estudos com cadeira",
    editavel: true,
  },
  {
    id: 3,
    autor: "Marcelo Dias",
    estrelas: 5,
    tempo: "há 45 dia(s)",
    texto: "Item exatamente como descrito no anúncio.",
    item: "Bicicleta infantil aro 16 com rodinhas",
    editavel: false,
  },
];

export default function MinhasAvaliacoes() {
  return (
    <div className="w-full">
      {/* Cabeçalho da Página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Avaliações</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Média 4,7 · 3 avaliações · edição permitida por até 30 dias
        </p>
      </div>

      {/* Lista de Avaliações */}
      <div className="flex flex-col gap-4">
        {mockAvaliacoes.map((avaliacao) => (
          <div
            key={avaliacao.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            {/* Informações do Autor e Estrelas */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">{avaliacao.autor}</span>
              <div className="flex items-center gap-0.5 ml-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < avaliacao.estrelas
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-1">· {avaliacao.tempo}</span>
            </div>

            {/* Texto da Avaliação */}
            <p className="text-gray-700 mb-1">{avaliacao.texto}</p>

            {/* Referência do Item */}
            <p className="text-sm text-gray-500 mb-4">
              Sobre: {avaliacao.item}
            </p>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              <button
                disabled={!avaliacao.editavel}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  avaliacao.editavel
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>

              <button
                disabled={!avaliacao.editavel}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  avaliacao.editavel
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-300 text-white cursor-not-allowed opacity-70"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>

              {/* Mensagem de bloqueio após 30 dias */}
              {!avaliacao.editavel && (
                <span className="text-sm text-gray-500 ml-2">
                  Janela de 30 dias encerrada
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}