"use client";

import { useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import type { CampoFiltro } from "@/components/shared/barra-filtros";
import { filtrosValidos } from "@/lib/admin-filtros";

/** Lê da URL os filtros que a BarraFiltros grava, já validados. */
export function useFiltrosUrl(campos: readonly CampoFiltro[]) {
  const parsers = useMemo(() => Object.fromEntries(campos.map((campo) => [campo.nome, parseAsString])), [campos]);
  const [valores] = useQueryStates(parsers);
  return filtrosValidos(campos, valores);
}