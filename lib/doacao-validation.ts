export const ID_DOACAO = /^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;
export const MAX_FOTO = 4 * 1024 * 1024;
export class ErroDoacao extends Error { }

const UFS_VALIDAS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO"
]);

export function campoDoacao(dados: FormData, campo: string, minimo?: number, maximo?: number): string {
  const valor = dados.get(campo);
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (minimo !== undefined && texto.length < minimo) {
    throw new ErroDoacao(`O campo ${campo} deve ter pelo menos ${minimo} caracteres.`);
  }

  if (maximo !== undefined && texto.length > maximo) {
    throw new ErroDoacao(`O campo ${campo} deve ter no máximo ${maximo} caracteres.`);
  }

  return texto;
}

export function validarLocalizacaoDoacao(dados: FormData) {
  const uf = campoDoacao(dados, "uf").toUpperCase();
  const cidade = campoDoacao(dados, "cidade");

  if (!UFS_VALIDAS.has(uf)) throw new ErroDoacao("Selecione uma UF válida.");
  if (!cidade) throw new ErroDoacao("Selecione uma cidade.");
  if (cidade.length > 100) throw new ErroDoacao("A cidade deve ter no máximo 100 caracteres.");

  return { uf, cidade };
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
