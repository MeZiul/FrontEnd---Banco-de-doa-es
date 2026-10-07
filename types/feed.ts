export const CONDICOES = { NOVO: "Novo", SEMINOVO: "Seminovo", USADO_BOM: "Usado em bom estado", USADO_REGULAR: "Usado em estado regular" } as const;
export const ORDENACOES = { recentes: "Mais recentes", antigos: "Mais antigos", visualizados: "Mais visualizados", interessados: "Mais procurados" } as const;
export type FiltrosFeed = {
  busca: string; categoria_id: string; cidade: string; uf: string;
  condicao_item: keyof typeof CONDICOES | "";
  ordenacao: keyof typeof ORDENACOES;
  page: number;
};
export type CategoriaFeed = { _id: string; nome: string };
export type ItemFeed = {
  _id: string; titulo: string; cidade: string; uf: string;
  condicao_item: keyof typeof CONDICOES;
  categoria_id: CategoriaFeed | null;
  fotos: { _id: string; url: string; ordem: number }[];
};
