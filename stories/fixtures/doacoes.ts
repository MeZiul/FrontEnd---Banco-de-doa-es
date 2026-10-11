import type { Paginado } from "@/types/api";
import type { FiltrosFeed, ItemFeed } from "@/types/feed";

export const doacoesExemplo: ItemFeed[] = [
  {
    _id: "000000000000000000000001",
    titulo: "Mesa de madeira para estudos",
    cidade: "Vilhena",
    uf: "RO",
    condicao_item: "USADO_BOM",
    categoria_id: { _id: "000000000000000000000101", nome: "Móveis" },
    fotos: [],
  },
  {
    _id: "000000000000000000000002",
    titulo: "Kit de livros infantis",
    cidade: "Colorado do Oeste",
    uf: "RO",
    condicao_item: "SEMINOVO",
    categoria_id: { _id: "000000000000000000000102", nome: "Livros" },
    fotos: [],
  },
];

export const resultadoDoacoesExemplo: Paginado<ItemFeed> = {
  docs: doacoesExemplo,
  totalDocs: doacoesExemplo.length,
  limit: 20,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};

export const filtrosDoacoesExemplo: FiltrosFeed = {
  busca: "",
  categoria_id: "",
  cidade: "",
  uf: "",
  condicao_item: "",
  ordenacao: "recentes",
  page: 1,
};
