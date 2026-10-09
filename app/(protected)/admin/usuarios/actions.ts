"use server";

import { fetchApiAutenticado } from "@/lib/auth-server";

export interface AdminUsuario {
  _id: string;
  nome: string;
  email: string;
  cidade: string;
  uf: string;
  perfil: string;
  situacao: string;
  media_avaliacoes: number;
  total_avaliacoes: number;
  total_doacoes: number;
  data_cadastro: string;
}

export interface RespostaPaginada<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export async function listarUsuarios(
  pagina: number = 1,
  limit: number = 5
): Promise<RespostaPaginada<AdminUsuario>> {
  if (!Number.isSafeInteger(pagina) || pagina < 1) {
    throw new Error("Página inválida.");
  }

  if (![5, 10, 20, 50].includes(limit)) {
    throw new Error("Limite inválido.");
  }

  return fetchApiAutenticado<RespostaPaginada<AdminUsuario>>(
    "admin/usuarios",
    {
      params: {
        pagina,
        limit,
      },
    }
  );
}
