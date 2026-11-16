import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { CheckCircle2, Eye, MapPin, Package, UserRound } from "lucide-react";

import { ErroApi, fetchApi } from "@/lib/api";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";
import { ID_DOACAO } from "@/lib/doacao-validation";
import { fotoFeed } from "@/lib/feed";

import { FeedPhoto } from "@/components/feed/feed-photo";
import { FeedRetry } from "@/components/feed/feed-retry";
import { InteresseForm } from "@/components/doacoes/interesse-form";
import { BotaoVoltar } from "@/components/doacoes/botao-voltar";
import { ContatoWhatsApp } from "@/components/perfil/contato-whatsapp";

import {AvaliacaoDoacaoForm,CompartilharDoacao,DenunciaForm} from "@/components/doacoes/acoes-detalhes";

import { CONDICOES, type ItemFeed } from "@/types/feed";
import type { StatusItem } from "@/types/item-doacao";

// Tipagem dos detalhes da doação.
type Detalhe = ItemFeed & {
  descricao: string;
  bairro?: string;
  condicoes_doacao?: string;
  interesse_aceito_id?: string | null;
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

// Resposta detalhada do interesse.
// O backend retorna os telefones somente quando o interesse está ACEITO.
type InteresseDetalhado = {
  _id: string;

  status:
  | "PENDENTE"
  | "ACEITO"
  | "RECUSADO"
  | "CANCELADO"
  | "EXPIRADO";

  item_id: string | { _id: string };

  usuario_interessado_id: {
    _id: string;
    nome: string;
    telefone?: string | null;
  };

  usuario_doador_id: {
    _id: string;
    nome: string;
    telefone?: string | null;
  };
};

type Contato = {
  nome: string;
  telefone?: string | null;
};

const estados: Record<StatusItem, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
  DOADO: "Doado",
  CANCELADO: "Cancelado",
};

const estilosStatus: Record<StatusItem, string> = {
  DISPONIVEL: "bg-emerald-100 text-emerald-700",
  RESERVADO: "bg-blue-100 text-blue-700",
  AGUARDANDO_CONFIRMACAO: "bg-amber-100 text-amber-700",
  DOADO: "bg-slate-100 text-slate-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export default async function DetalhesDoacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!ID_DOACAO.test(id)) {
    notFound();
  }

  let item: Detalhe;

  // Busca os dados públicos da doação.
  try {
    item = await fetchApi<Detalhe>(`itemdoacao/${id}`, {
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    unstable_rethrow(erro);

    if (erro instanceof ErroApi && erro.status === 404) {
      notFound();
    }

    return (
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <BotaoVoltar />

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Detalhes da doação
          </h1>

          <p role="alert" className="mt-3 text-slate-600">
            Não foi possível carregar este anúncio.
          </p>

          <div className="mt-4">
            <FeedRetry />
          </div>
        </section>
      </main>
    );
  }

  // Verifica se existe uma sessão autenticada.
  const token = await getToken();

  let usuario: {
    _id: string;
    situacao: string;
  } | null = null;

  let falhaSessao = false;

  if (token) {
    try {
      if (await validarSessaoNativa(token)) {
        usuario = await fetchApi<{
          _id: string;
          situacao: string;
        }>("perfil", {
          token,
          signal: AbortSignal.timeout(10000),
        });
      }
    } catch (erro) {
      unstable_rethrow(erro);

      falhaSessao = !(
        erro instanceof ErroApi &&
        [401, 498].includes(erro.status)
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

  // Ordena as fotos sem alterar o objeto original.
  const fotosOrdenadas = [...item.fotos].sort(
    (a, b) => a.ordem - b.ordem
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:py-10">

      {/* Navegação superior */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BotaoVoltar />

        <nav
          aria-label="Navegação da doação"
          className="flex flex-wrap items-center gap-4 text-sm font-medium text-blue-700"
        >
          <Link href="/" className="hover:underline">
            Doações disponíveis
          </Link>

          <Link
            href="/doacoes/nova"
            className="hover:underline"
          >
            Anunciar doação
          </Link>
        </nav>
      </div>

      {/* Conteúdo principal */}
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">

          {/* Galeria de imagens */}
          <section
            aria-label={`Fotos de ${item.titulo}`}
            className="bg-slate-100"
          >
            {fotosOrdenadas.length > 0 ? (
              <div className="grid gap-1">
                {fotosOrdenadas.map((foto, index) => (
                  <FeedPhoto
                    key={foto._id}
                    src={fotoFeed({
                      ...item,
                      fotos: [foto],
                    })}
                    titulo={`${item.titulo} — foto ${index + 1}`}
                  />
                ))}
              </div>
            ) : (
              <FeedPhoto titulo={item.titulo} />
            )}
          </section>

          {/* Informações */}
          <div className="space-y-6 p-5 sm:p-7 lg:p-8">

            {/* Cabeçalho */}
            <header className="space-y-3">
              <p className="text-sm font-semibold text-blue-700">
                {item.categoria_id?.nome || "Doação"}
              </p>

              <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {item.titulo}
              </h1>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estilosStatus[item.status]
                  }`}
              >
                {estados[item.status]}
              </span>
            </header>

            {/* Descrição */}
            <section className="space-y-2">
              <h2 className="font-semibold text-slate-900">
                Sobre esta doação
              </h2>

              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
                {item.descricao}
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
    </main>
  );
}
