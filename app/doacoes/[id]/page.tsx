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
  let contato: Contato | null = null;

  // O contato só pode aparecer para participantes
  // de um interesse efetivamente aceito.
  const statusPermiteContato = [
    "RESERVADO",
    "AGUARDANDO_CONFIRMACAO",
  ].includes(item.status);

  if (usuario && token && item.interesse_aceito_id) {
    try {
      const interesse = await fetchApi<InteresseDetalhado>(
        `interesses/${item.interesse_aceito_id}`,
        {
          token,
          signal: AbortSignal.timeout(10000),
        }
      );

      const itemId =
        typeof interesse.item_id === "string"
          ? interesse.item_id
          : interesse.item_id._id;

      // Confirma que o interesse retornado pertence
      // à doação consultada e está aceito.
      const interesseValido =
        interesse.status === "ACEITO" &&
        interesse._id === item.interesse_aceito_id &&
        itemId === item._id &&
        interesse.usuario_doador_id._id === item.usuario_id._id;

      if (interesseValido) {
        const souDoador =
          interesse.usuario_doador_id._id === usuario._id;

        const souInteressado =
          interesse.usuario_interessado_id._id === usuario._id;

        // Preserva a avaliação após a conclusão.
        if (item.status === "DOADO") {
          podeAvaliar = souDoador || souInteressado;
        }

        // Contato disponível somente durante a reserva.
        if (statusPermiteContato) {
          if (souDoador) {
            contato = {
              nome: interesse.usuario_interessado_id.nome,
              telefone:
                interesse.usuario_interessado_id.telefone,
            };
          } else if (souInteressado) {
            contato = {
              nome: interesse.usuario_doador_id.nome,
              telefone: interesse.usuario_doador_id.telefone,
            };
          }
        }
      }
    } catch (erro) {
      unstable_rethrow(erro);

      // Falhas de autenticação, autorização ou consulta
      // não devem expor informações privadas.
      // A página pública continua disponível.
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

            {/* Informações gerais */}
            <dl className="grid gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">

              <div className="flex items-start gap-3">
                <Package
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />

                <div>
                  <dt className="text-xs text-slate-500">
                    Condição
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {CONDICOES[item.condicao_item]}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />

                <div>
                  <dt className="text-xs text-slate-500">
                    Localização
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {[item.bairro, item.cidade, item.uf]
                      .filter(Boolean)
                      .join(" / ")}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserRound
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />

                <div>
                  <dt className="text-xs text-slate-500">
                    Doador
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {item.usuario_id?.nome ?? "Doador"}
                  </dd>

                  <dd className="mt-1 text-xs text-slate-500">
                    Média{" "}
                    {item.usuario_id?.media_avaliacoes ?? 0}/5
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />

                <div>
                  <dt className="text-xs text-slate-500">
                    Visualizações
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {item.visualizacoes}
                  </dd>
                </div>
              </div>
            </dl>

            {/* Condições da doação */}
            {item.condicoes_doacao && (
              <section className="space-y-2">
                <h2 className="font-semibold text-slate-900">
                  Condições da doação
                </h2>

                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
                  {item.condicoes_doacao}
                </p>
              </section>
            )}

            {/* Contato após aceite */}
            {contato && (
              <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />

                  <div>
                    <h2 className="font-semibold text-emerald-900">
                      Contato disponível
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                      Esta doação foi reservada e você participa
                      da entrega. Entre em contato para combinar
                      os próximos passos.
                    </p>
                  </div>
                </div>

                {contato.telefone ? (
                  <ContatoWhatsApp
                    telefone={contato.telefone}
                    nome={contato.nome}
                  />
                ) : (
                  <p className="text-sm text-slate-600">
                    O participante não possui um telefone
                    disponível para contato.
                  </p>
                )}
              </section>
            )}

            {/* Ações conforme status */}
            {item.status !== "DISPONIVEL" ? (
              <p
                role="status"
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
              >
                Este item não está disponível para novos interesses.
              </p>
            ) : proprio ? (
              <Link
                href="/perfil/meus-anuncios"
                className="inline-flex rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Gerenciar meu anúncio
              </Link>
            ) : falhaSessao ? (
              <section role="alert" className="space-y-3">
                <p className="text-sm text-slate-600">
                  Não foi possível verificar sua conta.
                  Tente novamente.
                </p>

                <FeedRetry />
              </section>
            ) : !usuario ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(
                  `/doacoes/${id}`
                )}`}
                className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Entrar para manifestar interesse
              </Link>
            ) : usuario.situacao !== "ATIVO" ? (
              <p role="alert" className="text-sm text-red-700">
                Sua conta precisa estar ativa para
                manifestar interesse.
              </p>
            ) : (
              <InteresseForm itemId={id} />
            )}

            {/* Avaliação */}
            {podeAvaliar && (
              <AvaliacaoDoacaoForm itemId={id} />
            )}

            {/* Ações secundárias */}
            <div className="space-y-4 border-t border-slate-200 pt-5">
              <CompartilharDoacao titulo={item.titulo} />

              {usuario?.situacao === "ATIVO" && !proprio && (
                <DenunciaForm itemId={id} />
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}