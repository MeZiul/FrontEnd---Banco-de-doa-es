"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado, getUsuarioLogado } from "@/lib/auth-server";
import type { CondicaoItem, InteresseAnuncio, MeuAnuncio, ResultadoAnuncio } from "@/types/item-doacao";

const caminho = "/perfil/meus-anuncios";
const idValido = /^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;
class ErroFormulario extends Error {}

function texto(dados: FormData, campo: string, minimo: number, maximo: number) {
  const valor = dados.get(campo);
  if (typeof valor !== "string" || valor.trim().length < minimo || valor.trim().length > maximo) {
    throw new ErroFormulario(`Verifique o campo ${campo}: informe de ${minimo} a ${maximo} caracteres.`);
  }
  return valor.trim();
}

async function proprioAnuncio(id: string) {
  if (!idValido.test(id)) throw new ErroFormulario("Identificador de anúncio inválido.");
  const usuario = await getUsuarioLogado();
  const anuncios = await fetchApiAutenticado<MeuAnuncio[]>(`usuario/${encodeURIComponent(usuario._id)}/itens`);
  const item = anuncios.find((anuncio) => anuncio._id === id && anuncio.usuario_id === usuario._id);
  if (!item) throw new ErroFormulario("Anúncio não encontrado entre suas doações.");
  return { item, usuario };
}

function falha(erro: unknown): ResultadoAnuncio {
  unstable_rethrow(erro);
  return { sucesso: false, mensagem: erro instanceof ErroApi || erro instanceof ErroFormulario ? erro.message : "Não foi possível completar a ação. Tente novamente." };
}

export async function carregarInteressados(id: string): Promise<{ interesses: InteresseAnuncio[]; mensagem?: string }> {
  try {
    const { usuario } = await proprioAnuncio(id);
    if (usuario.situacao !== "ATIVO") throw new ErroFormulario("Sua conta precisa estar ativa para consultar interessados.");
    const interesses = await fetchApiAutenticado<InteresseAnuncio[]>(`itens/${id}/interesses`);
    // Os dados de contato não são necessários para escolher um interessado.
    return { interesses: interesses.map(({ _id, item_id, status, mensagem_interessado, usuario_interessado_id }) => ({ _id, item_id, status, mensagem_interessado, usuario_interessado_id: { _id: usuario_interessado_id._id, nome: usuario_interessado_id.nome, cidade: usuario_interessado_id.cidade, uf: usuario_interessado_id.uf } })) };
  } catch (erro) {
    return { interesses: [], mensagem: falha(erro).mensagem };
  }
}

export async function alterarAnuncio(_anterior: ResultadoAnuncio, dados: FormData): Promise<ResultadoAnuncio> {
  try {
    const id = texto(dados, "id", 1, 80);
    const acao = texto(dados, "acao", 1, 20);
    const { item, usuario } = await proprioAnuncio(id);
    if (acao === "editar") {
      if (item.status !== "DISPONIVEL") throw new ErroFormulario("Somente anúncios disponíveis podem ser editados.");
      const condicao = texto(dados, "condicao_item", 1, 20) as CondicaoItem;
      if (!["NOVO", "SEMINOVO", "USADO_BOM", "USADO_REGULAR"].includes(condicao)) throw new ErroFormulario("Condição inválida.");
      const uf = texto(dados, "uf", 2, 2).toUpperCase();
      if (!/^[A-Z]{2}$/.test(uf)) throw new ErroFormulario("Informe uma UF válida com duas letras.");
      await fetchApiAutenticado(`itemdoacao/${id}`, { metodo: "PUT", body: {
        titulo: texto(dados, "titulo", 3, 100), descricao: texto(dados, "descricao", 10, 2000),
        condicao_item: condicao, cidade: texto(dados, "cidade", 1, 100), uf,
        bairro: texto(dados, "bairro", 0, 100), condicoes_doacao: texto(dados, "condicoes_doacao", 0, 500),
      } });
    } else if (acao === "entregar") {
      if (item.status !== "RESERVADO") throw new ErroFormulario("O anúncio precisa estar reservado para confirmar a entrega.");
      await fetchApiAutenticado(`itemdoacao/${id}/confirmar-entrega`, { metodo: "PUT" });
    } else if (acao === "cancelar") {
      if (["DOADO", "CANCELADO"].includes(item.status)) throw new ErroFormulario("Esta doação não pode ser cancelada.");
      await fetchApiAutenticado(`itens/${id}/cancelar`, { metodo: "PATCH", body: { motivo: texto(dados, "motivo", 10, 2000) } });
    } else if (acao === "aceitar" || acao === "recusar") {
      if (usuario.situacao !== "ATIVO" || item.status !== "DISPONIVEL") throw new ErroFormulario("Uma conta ativa e um anúncio disponível são necessários para responder.");
      const interesseId = texto(dados, "interesseId", 1, 80);
      if (!idValido.test(interesseId)) throw new ErroFormulario("Identificador de interesse inválido.");
      const interesses = await fetchApiAutenticado<InteresseAnuncio[]>(`itens/${id}/interesses`);
      if (!interesses.some((interesse) => interesse._id === interesseId && interesse.item_id === id && interesse.status === "PENDENTE")) throw new ErroFormulario("O interesse não está mais pendente neste anúncio.");
      await fetchApiAutenticado(`interesses/${interesseId}/${acao}`, { metodo: "PUT", body: {} });
    } else {
      throw new ErroFormulario("Ação inválida.");
    }
    revalidatePath(caminho);
    return { sucesso: true, mensagem: "Alteração salva com sucesso." };
  } catch (erro) {
    return falha(erro);
  }
}
