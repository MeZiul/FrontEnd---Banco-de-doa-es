"use client";

import { useState, useTransition } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import { atualizarAvaliacao, removerAvaliacao } from "@/app/(protected)/perfil/minhas-avaliacoes/actions";
import { cn } from "@/lib/utils";

export type AvaliacaoCardProps = {
  id: string;
  autor: string;
  estrelas: number;
  tempo: string;
  texto: string | null;
  item: string;
  feitaPorMim: boolean;
  editavel: boolean;
  diasParaEditar: number;
};

export function AvaliacaoCard({
  id,
  autor,
  estrelas,
  tempo,
  texto,
  item,
  feitaPorMim,
  editavel,
  diasParaEditar,
}: AvaliacaoCardProps) {
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState(estrelas);
  const [comentario, setComentario] = useState(texto ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function abrirEdicao() {
    setNota(estrelas);
    setComentario(texto ?? "");
    setErro(null);
    setEditando(true);
  }

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await atualizarAvaliacao(id, { nota, comentario });
      if (resultado?.erro) setErro(resultado.erro);
      else setEditando(false);
    });
  }

  function remover() {
    if (!window.confirm("Remover esta avaliação? Essa ação não pode ser desfeita.")) return;

    setErro(null);
    startTransition(async () => {
      const resultado = await removerAvaliacao(id);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 p-5 shadow-sm", pendente && "opacity-60")}>
      {/* Informações do Autor e Estrelas */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-gray-900">{autor}</span>
        <div className="flex items-center gap-0.5 ml-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const valor = index + 1;
            const preenchida = valor <= (editando ? nota : estrelas);
            const classe = cn("h-4 w-4", preenchida ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200");

            // Na edição, as estrelas viram botões para escolher a nota
            return editando ? (
              <button
                key={index}
                type="button"
                onClick={() => setNota(valor)}
                disabled={pendente}
                aria-label={`Nota ${valor}`}
                className="rounded p-0.5 transition-transform hover:scale-110"
              >
                <Star className={cn(classe, "h-5 w-5")} />
              </button>
            ) : (
              <Star key={index} className={classe} />
            );
          })}
        </div>
        <span className="text-gray-400 text-sm ml-1">· {tempo}</span>
      </div>

      {/* Texto da Avaliação */}
      {editando ? (
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          disabled={pendente}
          rows={3}
          placeholder="Escreva um comentário (opcional)"
          className="mb-2 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-gray-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        texto && <p className="text-gray-700 mb-1">{texto}</p>
      )}

      {/* Referência do Item */}
      <p className="text-sm text-gray-500 mb-4">
        Sobre: {item}
      </p>

      {erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

      {/* Botões de Ação (só o autor pode editar/remover) */}
      {feitaPorMim && (
        <div className="flex items-center gap-3">
          {editando ? (
            <>
              <button
                onClick={salvar}
                disabled={pendente}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                {pendente ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditando(false)}
                disabled={pendente}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={abrirEdicao}
                disabled={!editavel || pendente}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  editavel
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>

              <button
                onClick={remover}
                disabled={!editavel || pendente}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  editavel
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-300 text-white cursor-not-allowed opacity-70"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {pendente ? "Removendo..." : "Remover"}
              </button>

              {/* Mensagem de bloqueio após 30 dias */}
              {!editavel && (
                <span className="text-sm text-gray-500 ml-2">
                  Janela de {diasParaEditar} dias encerrada
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
