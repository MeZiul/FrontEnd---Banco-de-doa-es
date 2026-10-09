"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";

type Resultado = { erro: string } | undefined;

const PAGINA = "/perfil/minhas-avaliacoes";

function mensagemDeErro(erro: unknown) {
  // Deixa passar o redirect("/login") de sessão expirada (lib/auth-server.ts)
  unstable_rethrow(erro);
  return erro instanceof ErroApi ? erro.message : "Não foi possível falar com o servidor. Tente novamente.";
}

// PUT /avaliacoes/:id — a API só deixa o autor alterar
export async function atualizarAvaliacao(
  id: string,
  dados: { nota: number; comentario: string },
): Promise<Resultado> {
  try {
    await fetchApiAutenticado(`avaliacoes/${encodeURIComponent(id)}`, {
      metodo: "PUT",
      body: { nota: dados.nota, comentario: dados.comentario.trim() || null },
    });
  } catch (erro) {
    return { erro: mensagemDeErro(erro) };
  }

  // Recarrega a lista e a média (a API recalcula a média do avaliado)
  revalidatePath(PAGINA);
}

// DELETE /avaliacoes/:id — a API só deixa o autor (ou admin) remover
export async function removerAvaliacao(id: string): Promise<Resultado> {
  try {
    await fetchApiAutenticado(`avaliacoes/${encodeURIComponent(id)}`, { metodo: "DELETE" });
  } catch (erro) {
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath(PAGINA);
}
