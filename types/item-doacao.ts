export type StatusItem = "DISPONIVEL" | "RESERVADO" | "AGUARDANDO_CONFIRMACAO" | "DOADO" | "CANCELADO";
export type CondicaoItem = "NOVO" | "SEMINOVO" | "USADO_BOM" | "USADO_REGULAR";
export type MeuAnuncio = {
  _id: string; usuario_id: string; titulo: string; descricao: string;
  categoria_id: { _id: string; nome: string };
  condicao_item: CondicaoItem; cidade: string; uf: string;
  bairro?: string | null; condicoes_doacao?: string | null;
  status: StatusItem; total_interesses: number;
  fotos: { _id: string; url: string; ordem: number }[];
};
export type InteresseAnuncio = {
  _id: string; item_id: string;
  usuario_interessado_id: { _id: string; nome: string; cidade: string; uf: string };
  status: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO" | "EXPIRADO";
  mensagem_interessado?: string | null;
};
export type ResultadoAnuncio = { sucesso: boolean; mensagem: string };
