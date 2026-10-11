import type { FiltrosFeed } from "@/types/feed";

export function urlBuscas(filtros: FiltrosFeed, page = filtros.page) {
  const parametros = new URLSearchParams();
  const valores = { ...filtros, page };
  for (const [chave, valor] of Object.entries(valores)) {
    if (valor === "" || (chave === "ordenacao" && valor === "recentes") || (chave === "page" && valor === 1)) continue;
    parametros.set(chave, String(valor));
  }
  return parametros.size ? `/busca?${parametros.toString()}` : "/busca";
}
