"use server";

import { unstable_rethrow } from "next/navigation";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { FILTROS_USUARIOS, filtrosValidos } from "@/lib/admin-filtros";

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
const LIMITES_PERMITIDOS = [5, 10, 20, 50];

export async function listarUsuarios(
  pagina: number = 1,
  limit: number = 5,
  filtros: Record<string, unknown> = {}
): Promise<RespostaPaginada<AdminUsuario>> {
  if (!Number.isSafeInteger(pagina) || pagina < 1) {
    throw new Error("Página inválida.");
  }

  if (!LIMITES_PERMITIDOS.includes(limit)) {
    throw new Error("Limite inválido.");
  }

  return fetchApiAutenticado<RespostaPaginada<AdminUsuario>>(
    "admin/usuarios",
    {
      params: {
        page: pagina,
        limit,
        // Argumento de Server Action vem do navegador: só passam filtros conhecidos.
        ...filtrosValidos(FILTROS_USUARIOS, filtros),
      },
    }
  );
}
export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

type AcaoUsuario = "bloquear" | "desbloquear" | "inativar";

async function alterarSituacaoUsuario(id: string, acao: AcaoUsuario, body?: Record<string, unknown>): Promise<ResultadoAcao> {
  if (!id) return { ok: false, erro: "Usuário inválido." };

  try {
    await fetchApiAutenticado(
      `admin/usuarios/${encodeURIComponent(id)}/${acao}`,
      { metodo: "PUT", body: body ?? {} }
    );
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Não foi possível concluir a ação.",
    };
  }
}

export async function suspenderUsuario(
  id: string,
  justificativa: string,
  suspensaoAte?: string | null
) {
  const texto = justificativa.trim();
  if (!texto) return { ok: false, erro: "Informe a justificativa." } as const;

  if (suspensaoAte) {
    const data = new Date(suspensaoAte);

    if (Number.isNaN(data.getTime()) || data.getTime() <= Date.now()) {
      return { ok: false, erro: "A data de término deve ser futura." } as const;
    }
  }

  return alterarSituacaoUsuario(id, "bloquear", {
    justificativa: texto,
    suspensao_ate: suspensaoAte ?? null,
  });
}

export async function reativarUsuario(id: string) {
  return alterarSituacaoUsuario(id, "desbloquear");
}

export async function inativarUsuario(id: string) {
  return alterarSituacaoUsuario(id, "inativar");
}

/** Promove a administrador ou volta para usuário comum. A API revoga as sessões do usuário. */
export async function alterarPerfilUsuario(id: string, perfil: "USUARIO" | "ADMINISTRADOR"): Promise<ResultadoAcao> {
  if (!id) return { ok: false, erro: "Usuário inválido." };
  // Argumento de Server Action vem do navegador.
  if (perfil !== "USUARIO" && perfil !== "ADMINISTRADOR") return { ok: false, erro: "Perfil inválido." };

  try {
    await fetchApiAutenticado(`admin/usuarios/${encodeURIComponent(id)}/perfil`, { metodo: "PATCH", body: { perfil } });
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return { ok: false, erro: e instanceof Error ? e.message : "Não foi possível alterar o perfil." };
  }
}