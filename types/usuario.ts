export type PerfilUsuario = "USUARIO" | "ADMINISTRADOR";

export type SituacaoUsuario = "ATIVO" | "INATIVO" | "SUSPENSO";

export type Usuario = {
  _id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  cidade: string;
  uf: string;
  foto_perfil: string | null;
  bio: string | null;
  perfil: PerfilUsuario;
  situacao: SituacaoUsuario;
  media_avaliacoes: number;
  total_avaliacoes: number;
  total_doacoes: number;
  data_cadastro: string;
};
