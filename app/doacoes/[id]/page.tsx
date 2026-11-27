import Link from "next/link";
import { notFound } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";
import { ID_DOACAO } from "@/lib/doacao-validation";
import { fotoFeed } from "@/lib/feed";
import { FeedPhoto } from "@/components/feed/feed-photo";
import { FeedRetry } from "@/components/feed/feed-retry";
import { InteresseForm } from "@/components/doacoes/interesse-form";
import { AvaliacaoDoacaoForm, CompartilharDoacao, DenunciaForm } from "@/components/doacoes/acoes-detalhes";
import { CONDICOES, type ItemFeed } from "@/types/feed";
import type { StatusItem } from "@/types/item-doacao";
import { Home } from "lucide-react";
import { BotaoVoltar } from "@/components/shared/botao-voltar";

type Detalhe = ItemFeed & {
  descricao: string;
  bairro?: string;
  condicoes_doacao?: string;
  interesse_aceito_id?: string;
  status: StatusItem;
  visualizacoes: number;
  total_interesses: number;
  usuario_id: {
    _id: string;
    nome: string;
    cidade: string;
    uf: string;
    media_avaliacoes: number;
  };
};
const estados = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
  DOADO: "Doado",
  CANCELADO: "Cancelado",
};

export default async function DetalhesDoacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ID_DOACAO.test(id)) notFound();
  let item: Detalhe;
  try {
    item = await fetchApi<Detalhe>(`itemdoacao/${id}`, {
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">Detalhes da doação</h1>
        <p role="alert">Não foi possível carregar este anúncio.</p>
        <FeedRetry />
        <Link href="/" className="block text-blue-700 underline">
          Voltar às doações
        </Link>
      </div>
    );
  }
  const token = await getToken();
  let usuario: { _id: string; situacao: string } | null = null;
  let falhaSessao = false;
  if (token) {
    try {
      if (await validarSessaoNativa(token)) {
        usuario = await fetchApi("perfil", {
          token,
          signal: AbortSignal.timeout(10000),
        });
      }
    } catch (erro) {
      falhaSessao = !(
        erro instanceof ErroApi && [401, 498].includes(erro.status)
      );
    }
  }
  const proprio = usuario?._id === item.usuario_id?._id;
  let podeAvaliar = false;
  let avaliadoId: string | null = null;

  if (usuario && item.status === "DOADO" && item.interesse_aceito_id) {
    try {
      const interesse = await fetchApi<{
        usuario_interessado_id: { _id: string };
      }>(`interesses/${item.interesse_aceito_id}`, {
        token,
        signal: AbortSignal.timeout(10000),
      });

      const interessadoId = interesse.usuario_interessado_id._id;

      podeAvaliar = proprio || interessadoId === usuario._id;

      if (podeAvaliar) {
        avaliadoId = proprio ? interessadoId : item.usuario_id._id;
      }
    } catch {
      // Não é possível inferir a participação pelos dados públicos.
    }
  }
  return (
    <div className="w-full space-y-4">
      <nav aria-label="Navegação da doação" className="flex flex-wrap items-center gap-3">
        <BotaoVoltar />

        <Link href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Início
        </Link>

        <Link href="/doacoes/nova"
          className="ml-auto inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Anunciar doação
        </Link>
      </nav>
      <article className="grid overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
        <div className="flex min-w-0 flex-col justify-center gap-3 bg-slate-50 p-4 lg:p-6 [&>div]:rounded-xl">
          {item.fotos.length ? (
            [...item.fotos]
              .sort((a, b) => a.ordem - b.ordem)
              .map((foto, index) => (
                <FeedPhoto
                  key={foto._id}
                  src={fotoFeed({ ...item, fotos: [foto] })}
                  titulo={`${item.titulo} — foto ${index + 1}`}
                />
              ))
          ) : (
            <FeedPhoto titulo={item.titulo} />
          )}
        </div>
        <div className="min-w-0 space-y-4 p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {item.categoria_id?.nome || "Doação"}
            </p>
            <h1 className="mt-1 break-words text-3xl font-bold">
              {item.titulo}
            </h1>
            <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
              {estados[item.status] ?? item.status}
            </span>
          </div>
          <p className="whitespace-pre-wrap break-words text-slate-700">
            {item.descricao}
          </p>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Condição</dt>
              <dd>{CONDICOES[item.condicao_item]}</dd>
            </div>
            <div>
              <dt className="font-semibold">Localização</dt>
              <dd>
                {[item.bairro, item.cidade, item.uf]
                  .filter(Boolean)
                  .join(" / ")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Doador</dt>
              <dd>
                {item.usuario_id?.nome ?? "Doador"} · Média{" "}
                {item.usuario_id?.media_avaliacoes ?? 0}/5
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Visualizações</dt>
              <dd>{item.visualizacoes}</dd>
            </div>
          </dl>
          {item.condicoes_doacao && (
            <section>
              <h2 className="font-semibold">Condições da doação</h2>
              <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">
                {item.condicoes_doacao}
              </p>
            </section>
          )}
          {item.status !== "DISPONIVEL" ? (
            <p role="status" className="rounded-xl bg-slate-100 p-4">
              Este item não está disponível para novos interesses.
            </p>
          ) : proprio ? (
            <Link
              href="/perfil/meus-anuncios"
              className="inline-block text-blue-700 underline"
            >
              Gerenciar meu anúncio
            </Link>
          ) : falhaSessao ? (
            <section role="alert">
              <p>Não foi possível verificar sua conta. Tente novamente.</p>
              <FeedRetry />
            </section>
          ) : !usuario ? (
            <Link
              href={`/login?redirect=${encodeURIComponent(`/doacoes/${id}`)}`}
              className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Entrar para manifestar interesse
            </Link>
          ) : usuario.situacao !== "ATIVO" ? (
            <p role="alert">
              Sua conta precisa estar ativa para manifestar interesse.
            </p>
          ) : (
            <InteresseForm itemId={id} />
          )}
          {podeAvaliar && avaliadoId && (
            <AvaliacaoDoacaoForm
              itemId={id}
              avaliadoId={avaliadoId}
              tipo={proprio ? "DOADOR_PARA_INTERESSADO" : "INTERESSADO_PARA_DOADOR"}
            />
          )}
          <CompartilharDoacao titulo={item.titulo} />
          {usuario?.situacao === "ATIVO" && !proprio && (
            <DenunciaForm itemId={id} />
          )}
        </div>
      </article>
    </div>
  );
}
