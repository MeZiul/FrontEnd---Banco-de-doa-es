"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";

type ResultadoRecebimento = { sucesso: boolean; mensagem: string };
type Referencia = string | { _id?: string | null } | null | undefined;
type InteresseRecebimento = {
  _id: string;
  status: string;
  item_id: Referencia;
  usuario_interessado_id: Referencia;
};
type ItemRecebimento = {
  _id: string;
  status: string;
  interesse_aceito_id?: Referencia;
};

const idValido = /^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;
class ErroFormulario extends Error {}

function referenciaId(referencia: Referencia) {
  return typeof referencia === "string" ? referencia : referencia?._id ?? null;
}

function ehTimeout(erro: unknown) {
  return typeof erro === "object" && erro !== null && "name" in erro && erro.name === "TimeoutError";
}

function falha(erro: unknown): ResultadoRecebimento {
  unstable_rethrow(erro);
  return {
    sucesso: false,
    mensagem: erro instanceof ErroApi || erro instanceof ErroFormulario
      ? erro.message
      : "Não foi possível confirmar o recebimento. Atualize a página e tente novamente.",
  };
}

function revalidarTelas(itemId: string) {
  revalidatePath("/perfil/minhas-solicitacoes");
  revalidatePath("/perfil/meus-anuncios");
  revalidatePath(`/doacoes/${itemId}`);
}

export async function confirmarRecebimento(
  _anterior: ResultadoRecebimento,
  dados: FormData,
): Promise<ResultadoRecebimento> {
  try {
    const valor = dados.get("interesseId");
    if (typeof valor !== "string" || !idValido.test(valor)) {
      throw new ErroFormulario("Solicitação inválida. Atualize a página e tente novamente.");
    }

    const usuario = await getUsuarioLogado();
    if (usuario.situacao !== "ATIVO") {
      throw new ErroFormulario("Sua conta precisa estar ativa para confirmar o recebimento.");
    }

    const interesse = await fetchApiAutenticado<InteresseRecebimento>(
      `interesses/${encodeURIComponent(valor)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (interesse._id !== valor || referenciaId(interesse.usuario_interessado_id) !== usuario._id) {
      throw new ErroFormulario("Esta solicitação não pertence à sua conta.");
    }
    if (interesse.status !== "ACEITO") {
      throw new ErroFormulario("Somente uma solicitação aceita pode confirmar o recebimento.");
    }

    const itemId = referenciaId(interesse.item_id);
    if (!itemId || !idValido.test(itemId)) {
      throw new ErroFormulario("Não foi possível identificar a doação. Atualize a página e tente novamente.");
    }

    const item = await fetchApiAutenticado<ItemRecebimento>(
      `itemdoacao/${encodeURIComponent(itemId)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (item._id !== itemId || referenciaId(item.interesse_aceito_id) !== interesse._id) {
      throw new ErroFormulario("Esta solicitação não é a que foi aceita para a doação.");
    }

    if (item.status === "DOADO") {
      revalidarTelas(itemId);
      return { sucesso: true, mensagem: "O recebimento já consta como confirmado." };
    }
    if (item.status !== "AGUARDANDO_CONFIRMACAO") {
      throw new ErroFormulario("A doação não está aguardando confirmação de recebimento. Atualize a página.");
    }

    try {
      await fetchApiAutenticado(`itemdoacao/${encodeURIComponent(itemId)}/confirmar-recebimento`, {
        metodo: "PUT",
        signal: AbortSignal.timeout(15000),
      });
    } catch (erro) {
      if (ehTimeout(erro)) {
        throw new ErroFormulario("Não conseguimos confirmar a resposta. Atualize a página para verificar o estado antes de repetir.");
      }
      throw erro;
    }

    revalidarTelas(itemId);
    return { sucesso: true, mensagem: "Recebimento confirmado. A doação foi concluída." };
  } catch (erro) {
    return falha(erro);
  }
}
