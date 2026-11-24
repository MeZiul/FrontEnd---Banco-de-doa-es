"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { campoDoacao, ID_DOACAO } from "@/lib/doacao-validation";

export type AdminCategoria = {
  _id: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  ordem: number;
};
export type ResultadoCategoria = { sucesso: boolean; mensagem: string };

const caminho = "/admin/categorias";
class ErroFormulario extends Error {}

function idCategoria(dados: FormData) {
  const id = campoDoacao(dados, "id");
  if (!ID_DOACAO.test(id)) throw new ErroFormulario("Categoria inválida.");
  return id;
}

function lerCategoria(dados: FormData) {
  const nome = campoDoacao(dados, "nome");
  if (nome.length < 2 || nome.length > 60) throw new ErroFormulario("O nome deve ter de 2 a 60 caracteres.");
  const descricao = campoDoacao(dados, "descricao");
  if (descricao.length > 300) throw new ErroFormulario("A descrição deve ter no máximo 300 caracteres.");
  const ordem = campoDoacao(dados, "ordem") || "0";
  if (!/^\d{1,4}$/.test(ordem)) throw new ErroFormulario("A ordem deve ser um número inteiro de 0 a 9999.");
  return { nome, descricao, ordem: Number(ordem), ativo: dados.get("ativo") === "on" };
}

function falha(erro: unknown, mensagem409?: string): ResultadoCategoria {
  unstable_rethrow(erro);
  if (mensagem409 && erro instanceof ErroApi && erro.status === 409) return { sucesso: false, mensagem: mensagem409 };
  return {
    sucesso: false,
    mensagem: erro instanceof ErroApi || erro instanceof ErroFormulario ? erro.message : "Não foi possível completar a ação. Tente novamente.",
  };
}

export async function salvarCategoria(_anterior: ResultadoCategoria, dados: FormData): Promise<ResultadoCategoria> {
  try {
    const editando = campoDoacao(dados, "id") !== "";
    const id = editando ? idCategoria(dados) : "";
    const body = lerCategoria(dados);
    await fetchApiAutenticado(editando ? `categorias/${id}` : "categorias", { metodo: editando ? "PUT" : "POST", body });
    revalidatePath(caminho);
    return { sucesso: true, mensagem: editando ? "Categoria atualizada." : "Categoria criada." };
  } catch (erro) {
    return falha(erro);
  }
}

export async function excluirCategoria(_anterior: ResultadoCategoria, dados: FormData): Promise<ResultadoCategoria> {
  try {
    await fetchApiAutenticado(`categorias/${idCategoria(dados)}`, { metodo: "DELETE" });
    revalidatePath(caminho);
    return { sucesso: true, mensagem: "Categoria excluída." };
  } catch (erro) {
    // O banco impede excluir categoria com doações (onDelete: Restrict); a saída é desativar.
    return falha(erro, "Esta categoria tem doações vinculadas e não pode ser excluída. Desative-a para ela sair das opções.");
  }
}
