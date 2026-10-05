import { Star, Pencil, Trash2 } from "lucide-react";
import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";
import type { Paginado } from "@/types/api";
import type { Avaliacao } from "@/types/avaliacao";

// Regra do produto: o autor pode editar/remover a avaliação por até 30 dias
const DIAS_PARA_EDITAR = 30;

function diasDesde(data: string) {
  return Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
}

function formatarTempo(dias: number) {
  return dias === 0 ? "hoje" : `há ${dias} dia(s)`;
}

export default async function MinhasAvaliacoes() {
  // GET /avaliacoes devolve as avaliações que o usuário fez e as que recebeu
  const [usuario, { docs }] = await Promise.all([
    getUsuarioLogado(),
    fetchApiAutenticado<Paginado<Avaliacao>>("avaliacoes", { params: { limite: 100 } }),
  ]);

  const avaliacoes = docs.map((avaliacao) => {
    const dias = diasDesde(avaliacao.data_avaliacao);
    const feitaPorMim = avaliacao.avaliador_id._id === usuario._id;

    return {
      id: avaliacao._id,
      autor: feitaPorMim ? `Você avaliou ${avaliacao.avaliado_id.nome}` : avaliacao.avaliador_id.nome,
      estrelas: avaliacao.nota,
      tempo: formatarTempo(dias),
      texto: avaliacao.comentario,
      item: avaliacao.item_id.titulo,
      feitaPorMim,
      editavel: feitaPorMim && dias <= DIAS_PARA_EDITAR,
    };
  });

  const media = usuario.media_avaliacoes.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className="w-full">
      {/* Cabeçalho da Página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Avaliações</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Média {media} · {usuario.total_avaliacoes} avaliação(ões) recebida(s) · edição permitida por até {DIAS_PARA_EDITAR} dias
        </p>
      </div>

      {avaliacoes.length === 0 && (
        <p className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
          Você ainda não fez nem recebeu avaliações.
        </p>
      )}

      {/* Lista de Avaliações */}
      <div className="flex flex-col gap-4">
        {avaliacoes.map((avaliacao) => (
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
            {avaliacao.texto && <p className="text-gray-700 mb-1">{avaliacao.texto}</p>}

            {/* Referência do Item */}
            <p className="text-sm text-gray-500 mb-4">
              Sobre: {avaliacao.item}
            </p>

            {/* Botões de Ação (só o autor pode editar/remover) */}
            {avaliacao.feitaPorMim && (
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
                    Janela de {DIAS_PARA_EDITAR} dias encerrada
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}