"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { campoDoacao, ErroDoacao, ID_DOACAO } from "@/lib/doacao-validation";

export async function manifestarInteresse(_anterior: { sucesso: boolean; mensagem: string }, dados: FormData) {
  try {
    const id = campoDoacao(dados, "item_id", 1, 80);
    if (!ID_DOACAO.test(id)) throw new ErroDoacao("Doação inválida.");
    const mensagem = campoDoacao(dados, "mensagem_interessado", 0, 2000);
    await fetchApiAutenticado("interesses", {
      metodo: "POST", body: { item_id: id, ...(mensagem ? { mensagem_interessado: mensagem } : {}) }, signal: AbortSignal.timeout(15000),
    });
    revalidatePath(`/doacoes/${id}`);
    return { sucesso: true, mensagem: "Interesse enviado. Aguarde a resposta do doador." };
  } catch (erro) {
    unstable_rethrow(erro);
    return { sucesso: false, mensagem: erro instanceof ErroApi || erro instanceof ErroDoacao ? erro.message : "Não foi possível confirmar o envio. Verifique suas solicitações antes de tentar novamente." };
  }
}

export async function denunciarDoacao(_anterior: { sucesso: boolean; mensagem: string }, dados: FormData) {
  try {
    const id = campoDoacao(dados, "item_id", 1, 80);
    if (!ID_DOACAO.test(id)) throw new ErroDoacao("Doação inválida.");
    const tipo = campoDoacao(dados, "tipo_alvo", 1, 20);
    if (!["ITEM", "USUARIO"].includes(tipo)) throw new ErroDoacao("Alvo inválido.");
    const motivo = campoDoacao(dados, "motivo", 1, 40);
    if (!["CONTEUDO_INAPROPRIADO", "ITEM_PROIBIDO", "FRAUDE", "ASSEDIO", "SPAM", "OUTRO"].includes(motivo)) throw new ErroDoacao("Motivo inválido.");
    const descricao = campoDoacao(dados, "descricao", 0, 2000);
    const item = await fetchApiAutenticado<{ usuario_id: { _id: string } }>(`itemdoacao/${id}`, { signal: AbortSignal.timeout(10000) });
    await fetchApiAutenticado("denuncias", { metodo: "POST", signal: AbortSignal.timeout(15000), body: {
      tipo_alvo: tipo, motivo, ...(descricao ? { descricao } : {}),
      ...(tipo === "ITEM" ? { alvo_item_id: id } : { alvo_usuario_id: item.usuario_id._id }),
    } });
    return { sucesso: true, mensagem: "Denúncia registrada para análise da administração." };
  } catch (erro) {
    unstable_rethrow(erro);
    return { sucesso: false, mensagem: erro instanceof ErroApi || erro instanceof ErroDoacao ? erro.message : "Não foi possível registrar a denúncia. Tente novamente." };
  }
}

export async function avaliarDoacao(_anterior: { sucesso: boolean; mensagem: string }, dados: FormData) {
  try {
    const id = campoDoacao(dados, "item_id", 1, 80);
    if (!ID_DOACAO.test(id)) throw new ErroDoacao("Doação inválida.");
    const nota = Number(campoDoacao(dados, "nota", 1, 1));
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw new ErroDoacao("Escolha uma nota de 1 a 5.");
    const comentario = campoDoacao(dados, "comentario", 0, 2000);
    const usuario = await fetchApiAutenticado<{ _id: string }>("perfil", { signal: AbortSignal.timeout(10000) });
    const item = await fetchApiAutenticado<{ status: string; interesse_aceito_id?: string; usuario_id: { _id: string } }>(`itemdoacao/${id}`, { signal: AbortSignal.timeout(10000) });
    if (item.status !== "DOADO" || !item.interesse_aceito_id) throw new ErroDoacao("A doação precisa estar concluída para avaliar.");
    const interesse = await fetchApiAutenticado<{ usuario_interessado_id: { _id: string } }>(`interesses/${item.interesse_aceito_id}`, { signal: AbortSignal.timeout(10000) });
    const doador = item.usuario_id._id === usuario._id;
    if (!doador && interesse.usuario_interessado_id._id !== usuario._id) throw new ErroDoacao("Somente os participantes podem avaliar a doação.");
    await fetchApiAutenticado("avaliacoes", { metodo: "POST", signal: AbortSignal.timeout(15000), body: {
      item_id: id, avaliado_id: doador ? interesse.usuario_interessado_id._id : item.usuario_id._id,
      tipo: doador ? "DOADOR_PARA_INTERESSADO" : "INTERESSADO_PARA_DOADOR", nota, ...(comentario ? { comentario } : {}),
    } });
    revalidatePath(`/doacoes/${id}`); revalidatePath("/perfil/minhas-avaliacoes");
    return { sucesso: true, mensagem: "Avaliação registrada. Você pode consultá-la em Minhas avaliações." };
  } catch (erro) {
    unstable_rethrow(erro);
    return { sucesso: false, mensagem: erro instanceof ErroApi || erro instanceof ErroDoacao ? erro.message : "Não foi possível registrar a avaliação. Tente novamente." };
  }
}
