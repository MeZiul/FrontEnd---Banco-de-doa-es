export type AlvoAuditoria = { nome?: string; titulo?: string; motivo?: string; email?: string };
export type AdminAuditoria = {
  _id: string;
  administrador_id: { nome?: string; email?: string } | string | null;
  tipo_acao: string;
  tipo_alvo: string;
  alvo_id: AlvoAuditoria | string | null;
  alvo_model: string | null;
  justificativa: string | null;
  suspensao_ate: string | null;
  resultado_denuncia: string | null;
  resposta_administrativa: string | null;
  acao_tomada: string | null;
  data_acao: string;
};
