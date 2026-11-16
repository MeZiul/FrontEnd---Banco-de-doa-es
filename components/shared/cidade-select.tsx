"use client";

import { Combobox } from "@base-ui/react/combobox";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

// Busca os municípios da UF na API pública do IBGE (já vem em ordem alfabética).
// Se o IBGE demorar mais de 8s, a busca é tratada como falha.
async function buscarCidades(uf: string): Promise<string[]> {
  const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!resposta.ok) throw new Error("Não foi possível carregar as cidades.");
  const municipios: { nome: string }[] = await resposta.json();
  return municipios.map((municipio) => municipio.nome);
}

/** "Alta Floresta D'Oeste" -> "alta-floresta-d-oeste" (usado no data-test das opções). */
function slug(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Props = {
  id?: string;
  /** UF escolhida. Sem UF, o campo fica desabilitado. */
  uf: string;
  value: string;
  onValueChange: (cidade: string) => void;
  /** data-test do campo (Cypress). Cada opção recebe "opcaoCidade-<slug>", ex.: opcaoCidade-vilhena */
  dataTest?: string;
};

// Select de cidade com busca: mostra as cidades da UF escolhida.
export function CidadeSelect({ id, uf, value, onValueChange, dataTest }: Props) {
  const { data: cidades = [], isPending, isError } = useQuery({
    queryKey: ["cidades", uf],
    queryFn: () => buscarCidades(uf),
    enabled: Boolean(uf),
    staleTime: Infinity, // a lista de municípios praticamente não muda
  });
  const carregando = Boolean(uf) && isPending;

  // Sem a lista do IBGE, a pessoa digita a cidade para o cadastro não travar.
  if (isError) {
    return (
      <div className="space-y-1">
        <Input
          id={id}
          data-test={dataTest}
          type="text"
          placeholder="Digite sua cidade"
          autoComplete="address-level2"
          maxLength={100}
          required
          className="bg-background"
          value={value}
          onChange={(evento) => onValueChange(evento.target.value)}
        />
        <p role="status" className="text-xs text-muted-foreground">
          Não foi possível carregar a lista de cidades. Digite o nome da cidade.
        </p>
      </div>
    );
  }

  return (
    <Combobox.Root
      items={cidades}
      value={value || null}
      onValueChange={(cidade) => onValueChange(cidade ?? "")}
      disabled={!uf || carregando}
      limit={100}
    >
      <div className="relative">
        <Combobox.Input
          id={id}
          data-test={dataTest}
          placeholder={!uf ? "Escolha a UF primeiro" : carregando ? "Carregando cidades..." : "Buscar cidade"}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-background py-1 pr-8 pl-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        <Combobox.Trigger
          aria-label="Abrir lista de cidades"
          className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted-foreground disabled:opacity-50"
        >
          <ChevronDownIcon className="size-4" />
        </Combobox.Trigger>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="isolate z-50">
          <Combobox.Popup className="max-h-64 w-(--anchor-width) min-w-48 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <Combobox.Empty className="px-2 py-1.5 text-sm text-muted-foreground empty:hidden">
              Nenhuma cidade encontrada.
            </Combobox.Empty>
            <Combobox.List>
              {(cidade: string) => (
                <Combobox.Item
                  key={cidade}
                  value={cidade}
                  data-test={`opcaoCidade-${slug(cidade)}`}
                  className="relative flex w-full cursor-default items-center rounded-md py-1 pr-8 pl-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {cidade}
                  <Combobox.ItemIndicator className="absolute right-2 flex items-center">
                    <CheckIcon className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
