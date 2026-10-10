"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { ErroDoacao, validarNovaDoacao } from "@/lib/doacao-validation";

export type ResultadoCriacao = { sucesso: boolean; mensagem: string; itemId?: string };

export async function criarDoacao(dados: FormData): Promise<ResultadoCriacao> {
  try {
    const body = validarNovaDoacao(dados);
    const item = await fetchApiAutenticado<{ _id: string }>("itemdoacao", {
      metodo: "POST", body, signal: AbortSignal.timeout(15000),
    });
    revalidatePath("/");
    revalidatePath("/perfil/meus-anuncios");
    return { sucesso: true, mensagem: "Doação cadastrada.", itemId: item._id };
  } catch (erro) {
    unstable_rethrow(erro);
    return { sucesso: false, mensagem: erro instanceof ErroApi || erro instanceof ErroDoacao ? erro.message : "Não foi possível cadastrar. Verifique seus anúncios antes de tentar novamente." };
  }
}
