export type TipoAvaliacao = "DOADOR_PARA_INTERESSADO" | "INTERESSADO_PARA_DOADOR";

export type Avaliacao = {
  _id: string;
  item_id: { _id: string; titulo: string };
  avaliador_id: { _id: string; nome: string };
  avaliado_id: { _id: string; nome: string };
  nota: number;
  comentario: string | null;
  tipo: TipoAvaliacao;
  data_avaliacao: string;
};
