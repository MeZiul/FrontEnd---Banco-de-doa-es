"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { campoDoacao, ID_DOACAO } from "@/lib/doacao-validation";
import type { StatusItem } from "@/types/item-doacao";

export type AdminItem = {
  _id: string;
  titulo: string;
  status: StatusItem;
  cidade: string;
  uf: string;
  motivo_cancelamento: string | null;
  total_interesses: number;
  data_cadastro: string;
  usuario_id: { _id: string; nome: string; email: string } | null;
  categoria_id: { _id: string; nome: string } | null;
};
export type ResultadoModeracao = { sucesso: boolean; mensagem: string };

class ErroFormulario extends Error {}

export async function cancelarItemAdmin(_anterior: ResultadoModeracao, dados: FormData): Promise<ResultadoModeracao> {
  try {
    const id = campoDoacao(dados, "id");
    if (!ID_DOACAO.test(id)) throw new ErroFormulario("Anúncio inválido.");
    const motivo = campoDoacao(dados, "motivo");
    // Mesma regra do back: o motivo aparado precisa ter de 10 a 2000 caracteres.
    if (motivo.length < 10 || motivo.length > 2000) throw new ErroFormulario("Informe um motivo de 10 a 2000 caracteres.");

    await fetchApiAutenticado(`admin/itens/${id}/cancelar`, { metodo: "PUT", body: { motivo } });
    revalidatePath("/admin/itens");
    return { sucesso: true, mensagem: "Anúncio cancelado. O doador foi avisado com o motivo." };
  } catch (erro) {
    unstable_rethrow(erro);
    return {
      sucesso: false,
      mensagem: erro instanceof ErroApi || erro instanceof ErroFormulario ? erro.message : "Não foi possível cancelar o anúncio. Tente novamente.",
    };
  }
}