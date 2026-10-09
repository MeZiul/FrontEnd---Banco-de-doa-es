import { fetchApi } from "@/lib/api";
import type { Paginado } from "@/types/api";
import { CONDICOES, ORDENACOES, type CategoriaFeed, type FiltrosFeed, type ItemFeed } from "@/types/feed";

type Query = Record<string, string | string[] | undefined>;
const entityId = /^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;
export const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function lerFiltros(query: Query): FiltrosFeed {
  const value = (key: string) => (typeof query[key] === "string" ? query[key].trim() : "");
  const condicao = value("condicao_item");
  const ordenacao = value("ordenacao");
  const pagina = value("page");
  const uf = value("uf").toUpperCase();
  return {
    busca: value("busca"),
    categoria_id: entityId.test(value("categoria_id")) ? value("categoria_id") : "",
    cidade: value("cidade"), uf: UFS.includes(uf) ? uf : "",
    condicao_item: Object.hasOwn(CONDICOES, condicao) ? condicao as FiltrosFeed["condicao_item"] : "",
    ordenacao: Object.hasOwn(ORDENACOES, ordenacao) ? ordenacao as FiltrosFeed["ordenacao"] : "recentes",
    page: /^\d+$/.test(pagina) && Number.isSafeInteger(Number(pagina)) && Number(pagina) > 0 ? Number(pagina) : 1,
  };
}

export function urlFeed(filtros: FiltrosFeed, page = filtros.page) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filtros, page })) {
    if (value !== "") query.set(key, String(value));
  }
  return `/?${query.toString()}`;
}

export function listarFeed(filtros: FiltrosFeed) {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value !== ""));
  return fetchApi<Paginado<ItemFeed>>("itemdoacao", { params: { ...params, limit: 20 }, signal: AbortSignal.timeout(10000) });
}

export async function listarCategoriasFeed() {
  const categorias: CategoriaFeed[] = [];
  let page = 1;
  // Categorias usam "limite", itens usam "limit".
  const signal = AbortSignal.timeout(10000);
  while (true) {
    const resultado = await fetchApi<Paginado<CategoriaFeed>>("categorias", { params: { page, limite: 100 }, signal });
    categorias.push(...resultado.docs);
    if (!resultado.hasNextPage) return categorias;
    page += 1;
  }
}

export function fotoFeed(item: ItemFeed): string | undefined {
  const path = item.fotos?.[0]?.url;
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!path || !api) return undefined;
  try {
    const base = new URL(api);
    const foto = new URL(path, base);
    if (!["http:", "https:"].includes(foto.protocol) || foto.origin !== base.origin || !foto.pathname.startsWith("/uploads/itens/")) return undefined;
    return foto.href;
  } catch { return undefined; }
}
