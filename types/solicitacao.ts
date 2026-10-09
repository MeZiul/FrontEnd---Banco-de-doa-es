export type StatusSolicitacao = "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO" | "EXPIRADO";

type UsuarioResumo = {
  _id: string;
  nome: string;
  email: string;
  cidade: string;
  uf: string;
};

// Item de GET /interesses
export type Solicitacao = {
  _id: string;
  item_id: {
    _id: string;
    titulo: string;
    status: string;
    cidade: string;
    uf: string;
    total_interesses: number;
  };
  usuario_interessado_id: UsuarioResumo;
  usuario_doador_id: UsuarioResumo;
  mensagem_interessado: string | null;
  resposta_doador: string | null;
  status: StatusSolicitacao;
  data_interesse: string;
  data_resposta: string | null;
  data_cancelamento: string | null;
};
