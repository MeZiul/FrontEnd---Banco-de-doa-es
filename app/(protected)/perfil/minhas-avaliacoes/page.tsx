import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";
import type { Paginado } from "@/types/api";
import type { Avaliacao } from "@/types/avaliacao";
import { AvaliacaoCard } from "@/components/perfil/avaliacao-card";
import { PaginacaoLinks } from "@/components/shared/paginacao-links";

const LIMITE = 5;
const CAMINHO = "/perfil/minhas-avaliacoes";

type Query = {
  page?: string | string[];
  feitas?: string | string[];
  recebidas?: string | string[];
};

function parsePagina(valor: string | string[] | undefined) {
  if (typeof valor !== "string" || !/^\d+$/.test(valor)) return 1;
  const pagina = Number(valor);
  return Number.isSafeInteger(pagina) && pagina > 0 ? pagina : 1;
}

async function buscarPagina(
  page: number,
  filtro: { avaliador_id?: string; avaliado_id?: string } = {},
): Promise<Paginado<Avaliacao>> {
  return fetchApiAutenticado<Paginado<Avaliacao>>("avaliacoes", {
    params: { ...filtro, page, limite: LIMITE },
    signal: AbortSignal.timeout(10000),
  });
}

function paginaAtual(lista: Paginado<Avaliacao>, solicitada: number) {
  return Math.min(solicitada, Math.max(1, lista.totalPages));
}

function cardProps(avaliacao: Avaliacao, usuarioId: string) {
  const dias = Math.max(0, Math.floor((Date.now() - new Date(avaliacao.data_avaliacao).getTime()) / 86400000));
  const feitaPorMim = avaliacao.avaliador_id._id === usuarioId;

  return {
    id: avaliacao._id,
    autor: feitaPorMim ? `Você avaliou ${avaliacao.avaliado_id.nome}` : avaliacao.avaliador_id.nome,
    estrelas: avaliacao.nota,
    tempo: dias === 0 ? "hoje" : `há ${dias} dia(s)`,
    texto: avaliacao.comentario,
    item: avaliacao.item_id.titulo,
    feitaPorMim,
  };
}

function Cartoes({ docs, usuarioId }: { docs: Avaliacao[]; usuarioId: string }) {
  return (
    <div className="flex flex-col gap-4">
      {docs.map((avaliacao) => (
        <AvaliacaoCard key={avaliacao._id} {...cardProps(avaliacao, usuarioId)} />
      ))}
    </div>
  );
}

// "Mostrando X–Y de Z" + paginação numerada (‹ Anterior 1 [2] 3 … 9 Próxima ›).
function Paginacao({
  lista,
  rotulo,
  parametro = "page",
  extras,
}: {
  lista: Paginado<Avaliacao>;
  rotulo: string;
  /** Parâmetro de página na URL ("page"; no modo admin, "feitas" ou "recebidas"). */
  parametro?: string;
  /** Mantém na URL a página da outra seção (modo admin). */
  extras?: Record<string, string>;
}) {
  if (lista.totalDocs === 0) return null;
  const inicio = (lista.page - 1) * LIMITE + 1;

  return (
    <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-200 pt-4">
      <p className="text-sm text-gray-500">
        Mostrando {inicio}–{inicio + lista.docs.length - 1} de {lista.totalDocs}{" "}
        {lista.totalDocs === 1 ? "avaliação" : "avaliações"}
      </p>
      <PaginacaoLinks
        pagina={lista.page}
        totalPaginas={lista.totalPages}
        caminho={CAMINHO}
        parametro={parametro}
        extras={extras}
        rotulo={rotulo}
      />
    </div>
  );
}

export default async function MinhasAvaliacoes({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const usuario = await getUsuarioLogado();
  const media = usuario.media_avaliacoes.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  if (usuario.perfil === "ADMINISTRADOR") {
    const solicitadaFeitas = parsePagina(query.feitas);
    const solicitadaRecebidas = parsePagina(query.recebidas);
    const [feitasInicial, recebidasInicial] = await Promise.all([
      buscarPagina(solicitadaFeitas, { avaliador_id: usuario._id }),
      buscarPagina(solicitadaRecebidas, { avaliado_id: usuario._id }),
    ]);
    const pageFeitas = paginaAtual(feitasInicial, solicitadaFeitas);
    const pageRecebidas = paginaAtual(recebidasInicial, solicitadaRecebidas);
    const [feitas, recebidas] = await Promise.all([
      pageFeitas === solicitadaFeitas ? feitasInicial : buscarPagina(pageFeitas, { avaliador_id: usuario._id }),
      pageRecebidas === solicitadaRecebidas ? recebidasInicial : buscarPagina(pageRecebidas, { avaliado_id: usuario._id }),
    ]);

    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Minhas Avaliações</h1>
          <p className="mt-1 text-sm text-slate-500">Média {media} · {usuario.total_avaliacoes} avaliação(ões) recebida(s)</p>
        </div>

        <section aria-labelledby="avaliacoes-feitas" className="mb-8 space-y-4">
          <h2 id="avaliacoes-feitas" className="text-lg font-semibold text-slate-900">Feitas por mim</h2>
          {feitas.docs.length === 0
            ? <p className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">Você ainda não fez avaliações.</p>
            : <Cartoes docs={feitas.docs} usuarioId={usuario._id} />}
          <Paginacao
            lista={feitas}
            rotulo="Paginação das avaliações feitas por mim"
            parametro="feitas"
            extras={{ recebidas: String(pageRecebidas) }}
          />
        </section>

        <section aria-labelledby="avaliacoes-recebidas" className="space-y-4">
          <h2 id="avaliacoes-recebidas" className="text-lg font-semibold text-slate-900">Recebidas por mim</h2>
          {recebidas.docs.length === 0
            ? <p className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">Você ainda não recebeu avaliações.</p>
            : <Cartoes docs={recebidas.docs} usuarioId={usuario._id} />}
          <Paginacao
            lista={recebidas}
            rotulo="Paginação das avaliações recebidas por mim"
            parametro="recebidas"
            extras={{ feitas: String(pageFeitas) }}
          />
        </section>
      </div>
    );
  }

  const solicitada = parsePagina(query.page);
  const listaInicial = await buscarPagina(solicitada);
  const page = paginaAtual(listaInicial, solicitada);
  const lista = page === solicitada ? listaInicial : await buscarPagina(page);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Avaliações</h1>
        <p className="mt-1 text-sm text-slate-500">Média {media} · {usuario.total_avaliacoes} avaliação(ões) recebida(s)</p>
      </div>

      {lista.docs.length === 0 && (
        <p className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
          {lista.totalDocs === 0 ? "Você ainda não fez nem recebeu avaliações." : "Nenhuma avaliação nesta página."}
        </p>
      )}

      <Cartoes docs={lista.docs} usuarioId={usuario._id} />
      <Paginacao lista={lista} rotulo="Paginação das avaliações" />
    </div>
  );
}
