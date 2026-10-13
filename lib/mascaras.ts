// Máscaras de digitação: formatam o valor enquanto a pessoa digita.
// Antes de enviar à API, use `somenteDigitos` para guardar só os números.

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** 12345678909 -> 123.456.789-09 (aceita digitação parcial). */
export function mascararCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Celular: 69999990000 -> (69) 99999-0000
 * Fixo:    6933330000  -> (69) 3333-0000
 */
export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const numero = d.slice(2);
  // Com 11 dígitos é celular (5 + 4); até 10, fixo (4 + 4).
  const corte = d.length === 11 ? 5 : 4;
  if (numero.length <= corte) return `(${ddd}) ${numero}`;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}
