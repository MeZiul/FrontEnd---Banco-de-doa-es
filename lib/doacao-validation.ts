export const ID_DOACAO = /^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;
export const MAX_FOTO = 4 * 1024 * 1024;
export class ErroDoacao extends Error {}

export function campoDoacao(dados: FormData, campo: string) {
  const valor = dados.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export function lerNovaDoacao(dados: FormData) {
  return {
    titulo: campoDoacao(dados, "titulo"), descricao: campoDoacao(dados, "descricao"),
    categoria_id: campoDoacao(dados, "categoria_id"), condicao_item: campoDoacao(dados, "condicao_item"),
    cidade: campoDoacao(dados, "cidade"), uf: campoDoacao(dados, "uf").toUpperCase(),
    bairro: campoDoacao(dados, "bairro"), condicoes_doacao: campoDoacao(dados, "condicoes_doacao"),
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
