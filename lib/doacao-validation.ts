import { CONDICOES } from "@/types/feed";
import { UFS } from "@/lib/feed";

export const ID_DOACAO = /^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;
export const MAX_FOTO = 4 * 1024 * 1024;
export class ErroDoacao extends Error {}

export function campoDoacao(dados: FormData, campo: string, minimo: number, maximo: number) {
  const valor = dados.get(campo);
  if (typeof valor !== "string" || valor.trim().length < minimo || valor.trim().length > maximo) {
    throw new ErroDoacao(`Verifique ${campo}: informe de ${minimo} a ${maximo} caracteres.`);
  }
  return valor.trim();
}

export function validarNovaDoacao(dados: FormData) {
  const categoria_id = campoDoacao(dados, "categoria_id", 1, 80);
  if (!ID_DOACAO.test(categoria_id)) throw new ErroDoacao("Escolha uma categoria válida.");
  const condicao_item = campoDoacao(dados, "condicao_item", 1, 20);
  if (!Object.hasOwn(CONDICOES, condicao_item)) throw new ErroDoacao("Escolha uma condição válida.");
  const uf = campoDoacao(dados, "uf", 2, 2).toUpperCase();
  if (!UFS.includes(uf)) throw new ErroDoacao("Escolha uma UF válida.");
  return {
    titulo: campoDoacao(dados, "titulo", 3, 100), descricao: campoDoacao(dados, "descricao", 10, 2000),
    categoria_id, condicao_item, cidade: campoDoacao(dados, "cidade", 1, 100), uf,
    bairro: campoDoacao(dados, "bairro", 0, 100), condicoes_doacao: campoDoacao(dados, "condicoes_doacao", 0, 500),
  };
}

export function validarFotos(fotos: File[], maximo = 5) {
  if (fotos.length > maximo) throw new ErroDoacao(`Selecione até ${maximo} foto(s).`);
  for (const foto of fotos) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(foto.type) || foto.size === 0 || foto.size > MAX_FOTO) {
      throw new ErroDoacao("Use fotos JPEG, PNG ou WebP de até 4 MB cada.");
    }
  }
}
