import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { Clock, CheckCircle2, XCircle, Ban, User, Calendar, MapPin, Package } from "lucide-react";
import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";
import { ConfirmarRecebimentoForm } from "@/components/perfil/confirmar-recebimento-form";
import { FeedRetry } from "@/components/feed/feed-retry";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";
import type { Paginado } from "@/types/api";
import type { Solicitacao, StatusSolicitacao } from "@/types/solicitacao";

const ITENS_POR_PAGINA = 5;

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

function lerPagina(valor?: string) {
  return valor && /^\d+$/.test(valor) && Number.isSafeInteger(Number(valor)) && Number(valor) > 0
    ? Number(valor)
    : 1;
}

export default async function MinhasSolicitacoes({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const query = await searchParams;
  const page = lerPagina(query.page);
  let resultado: Paginado<Solicitacao>;

  try {
    const usuario = await getUsuarioLogado();
    resultado = await fetchApiAutenticado<Paginado<Solicitacao>>("interesses", {
      params: { usuario_interessado_id: usuario._id, page, limit: ITENS_POR_PAGINA },
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    unstable_rethrow(erro);
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h1>
          <p className="text-slate-500 mt-1">Doações nas quais você demonstrou interesse.</p>
        </div>
        <section role="alert" className="rounded-2xl border bg-white p-6">
          <p>Não foi possível carregar suas solicitações.</p>
          <FeedRetry />
        </section>
      </div>
    );
  }

  if (page > Math.max(1, resultado.totalPages)) {
    redirect(`/perfil/minhas-solicitacoes?page=${Math.max(1, resultado.totalPages)}`);
  }
  const { docs: solicitacoes } = resultado;

  return (
    <div className="w-full">
      {/* Cabeçalho da Página mantendo o texto da referência */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h1>
        <p className="text-slate-500 mt-1">Doações nas quais você demonstrou interesse.</p>
      </div>

      {solicitacoes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          {resultado.totalDocs === 0 ? "Você ainda não solicitou nenhuma doação." : "Nenhuma solicitação nesta página."}
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

                    {solicitacao.status === "ACEITO" && solicitacao.item_id.status === "AGUARDANDO_CONFIRMACAO" && (
                      <div className="w-full space-y-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                        <p>O doador confirmou a entrega. Confirme somente quando estiver com o item.</p>
                        <ConfirmarRecebimentoForm interesseId={solicitacao._id} />
                      </div>
                    )}

                    {solicitacao.status === "ACEITO" && solicitacao.item_id.status === "DOADO" && (
                      <p role="status" className="text-sm font-medium text-emerald-700">
                        Recebimento confirmado. Esta doação foi concluída.
                      </p>
                    )}

                    {solicitacao.status === "ACEITO" && !["AGUARDANDO_CONFIRMACAO", "DOADO"].includes(solicitacao.item_id.status) && (
                      <Link
                        href={`/doacoes/${solicitacao.item_id._id}`}
                        className="inline-flex items-center rounded-lg border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 underline-offset-4 hover:bg-blue-50 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      >
                        Ver detalhes da doação
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resultado.totalDocs > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Mostrando {(resultado.page - 1) * ITENS_POR_PAGINA + 1}–{(resultado.page - 1) * ITENS_POR_PAGINA + solicitacoes.length} de {resultado.totalDocs}{" "}
            {resultado.totalDocs === 1 ? "solicitação" : "solicitações"}
          </p>
          <PaginacaoLinks
            pagina={resultado.page}
            totalPaginas={resultado.totalPages}
            caminho="/perfil/minhas-solicitacoes"
            rotulo="Paginação das solicitações"
          />
        </div>
      )}
    </div>
  );
}
