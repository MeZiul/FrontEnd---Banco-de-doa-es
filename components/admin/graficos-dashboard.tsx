"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { GraficoAdmin, MesAdmin } from "@/lib/admin-metrics";

// Paleta categórica validada (validate_palette.js, modo claro): azul, laranja e verde-água, nessa ordem fixa.
// O verde-água tem contraste baixo com o fundo branco, por isso todo gráfico mostra os números escritos.
const CORES = ["#2a78d6", "#eb6834", "#1baf7a"] as const;
const AZUL = CORES[0];
const TRILHO = "#cde2fb";
const GRADE = "#e1e0d9";

const numero = new Intl.NumberFormat("pt-BR");
const porcentagem = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

type Parte = NonNullable<GraficoAdmin["partes"]>[number];

function fatia(total: number, soma: number) {
  const fracao = soma === 0 ? 0 : total / soma;
  // Evita mostrar "0%" para uma parte que existe.
  return fracao > 0 && fracao < 0.01 ? "<1%" : porcentagem.format(fracao);
}

function CartaoGrafico({ id, titulo, descricao, rodape, children }: { id: string; titulo: string; descricao: string; rodape?: ReactNode; children: ReactNode }) {
  const tituloId = `grafico-${id}`;
  return <Card data-grafico={id} role="group" aria-labelledby={tituloId} className="gap-4 p-6">
    <div className="space-y-1">
      <h3 id={tituloId} className="font-semibold text-foreground">{titulo}</h3>
      <p className="text-sm text-muted-foreground">{descricao}</p>
    </div>
    {children}
    {rodape && <p className="mt-auto text-xs text-muted-foreground">{rodape}</p>}
  </Card>;
}

function Aviso({ children }: { children: ReactNode }) {
  return <p className="flex min-h-32 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{children}</p>;
}

/** Legenda com o número de cada parte: a cor nunca é o único jeito de identificar a parte. */
function Legenda({ partes, soma }: { partes: Parte[]; soma: number }) {
  return <ul className="space-y-2">
    {partes.map((parte, indice) => <li key={parte.chave} className="flex items-center gap-2 text-sm">
      <span aria-hidden="true" className="size-3 shrink-0 rounded-sm" style={{ background: CORES[indice] }} />
      <span className="min-w-0 flex-1 text-foreground">{parte.rotulo}</span>
      <span className="font-semibold tabular-nums text-foreground">{numero.format(parte.total)}</span>
      <span className="w-11 text-right tabular-nums text-muted-foreground">{fatia(parte.total, soma)}</span>
    </li>)}
  </ul>;
}

/** Colunas verticais: compara o tamanho de cada etapa, mantendo a ordem do fluxo. */
function Colunas({ partes, soma }: { partes: Parte[]; soma: number }) {
  const maior = Math.max(...partes.map((parte) => parte.total));
  return <ul className="flex items-stretch gap-2 border-b pb-0 sm:gap-3" style={{ borderColor: GRADE }}>
    {partes.map((parte) => <li key={parte.chave} title={`${parte.rotulo}: ${numero.format(parte.total)} (${fatia(parte.total, soma)})`} className="flex min-w-0 flex-1 flex-col items-center">
      <div className="flex h-44 w-full flex-col items-center justify-end gap-1">
        <span className="text-sm font-semibold tabular-nums text-foreground">{numero.format(parte.total)}</span>
        <div
          aria-hidden="true"
          className="w-full max-w-12 rounded-t-[4px] transition-[height] duration-500 motion-reduce:transition-none"
          style={{ height: `${maior === 0 ? 0 : (parte.total / maior) * 82}%`, minHeight: parte.total > 0 ? 4 : 0, background: AZUL }}
        />
      </div>
      <span className="sr-only">{parte.rotulo}, {fatia(parte.total, soma)} do total</span>
    </li>)}
  </ul>;
}

function RotulosColunas({ partes }: { partes: Parte[] }) {
  return <div aria-hidden="true" className="-mt-2 flex gap-2 sm:gap-3">
    {partes.map((parte) => <span key={parte.chave} lang="pt-BR" className="min-w-0 flex-1 hyphens-auto text-center text-[11px] leading-tight text-muted-foreground [overflow-wrap:anywhere] sm:text-xs">{parte.rotulo}</span>)}
  </div>;
}

/** Barras horizontais com nome, barra e número por linha: bom para nomes longos. */
function Barras({ partes, soma }: { partes: Parte[]; soma: number }) {
  return <ul className="space-y-3">
    {partes.map((parte) => <li key={parte.chave} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5">
      <span className="text-sm text-foreground">{parte.rotulo}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {numero.format(parte.total)} <span className="font-normal text-muted-foreground">({fatia(parte.total, soma)})</span>
      </span>
      <div aria-hidden="true" className="col-span-2 h-2 overflow-hidden rounded-full" style={{ background: TRILHO }}>
        <div
          className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${(parte.total / soma) * 100}%`, minWidth: parte.total > 0 ? 4 : 0, background: AZUL }}
        />
      </div>
    </li>)}
  </ul>;
}

/** Rosca: mostra a fatia de cada parte no total, com o total no centro. */
function Rosca({ partes, soma, unidade }: { partes: Parte[]; soma: number; unidade: string }) {
  const raio = 60;
  const circunferencia = 2 * Math.PI * raio;
  const visiveis = partes.filter((parte) => parte.total > 0).length;
  // Espaço de 2px entre as fatias, só quando há mais de uma.
  const espaco = visiveis > 1 ? 2 : 0;
  const comprimentos = partes.map((parte) => (parte.total / soma) * circunferencia);
  const inicios = comprimentos.map((_, indice) => comprimentos.slice(0, indice).reduce((total, valor) => total + valor, 0));

  return <div className="flex flex-col items-center gap-6 sm:flex-row">
    <svg viewBox="0 0 160 160" className="size-40 shrink-0" role="img" aria-label={partes.map((parte) => `${parte.rotulo}: ${numero.format(parte.total)}`).join(", ")}>
      <circle cx="80" cy="80" r={raio} fill="none" stroke={GRADE} strokeWidth="22" />
      {partes.map((parte, indice) => {
        if (parte.total === 0) return null;
        const comprimento = comprimentos[indice];
        const deslocamento = inicios[indice];
        return <circle
          key={parte.chave}
          cx="80"
          cy="80"
          r={raio}
          fill="none"
          stroke={CORES[indice]}
          strokeWidth="22"
          strokeDasharray={`${Math.max(comprimento - espaco, 1)} ${circunferencia}`}
          strokeDashoffset={-deslocamento}
          transform="rotate(-90 80 80)"
        >
          <title>{`${parte.rotulo}: ${numero.format(parte.total)} (${fatia(parte.total, soma)})`}</title>
        </circle>;
      })}
      <text x="80" y="78" textAnchor="middle" className="fill-foreground text-[22px] font-bold">{numero.format(soma)}</text>
      <text x="80" y="98" textAnchor="middle" className="fill-muted-foreground text-[11px]">{unidade}</text>
    </svg>
    <div className="w-full min-w-0 flex-1"><Legenda partes={partes} soma={soma} /></div>
  </div>;
}

/** Barra segmentada: um total dividido em blocos, com a fatia escrita no bloco quando cabe. */
function Segmentado({ partes, soma }: { partes: Parte[]; soma: number }) {
  return <div className="space-y-4">
    <div aria-hidden="true" className="flex h-10 gap-0.5 overflow-hidden rounded-[4px]">
      {partes.map((parte, indice) => parte.total > 0 && <div
        key={parte.chave}
        title={`${parte.rotulo}: ${numero.format(parte.total)} (${fatia(parte.total, soma)})`}
        className="flex min-w-1 items-center justify-center text-xs font-semibold text-white transition-[flex-grow] duration-500 motion-reduce:transition-none"
        style={{ flexGrow: parte.total, flexBasis: 0, background: CORES[indice] }}
      >
        {parte.total / soma >= 0.12 && fatia(parte.total, soma)}
      </div>)}
    </div>
    <Legenda partes={partes} soma={soma} />
  </div>;
}

export function GraficoDistribuicao({ grafico }: { grafico: GraficoAdmin }) {
  const soma = grafico.partes?.reduce((total, parte) => total + parte.total, 0) ?? 0;
  const { partes } = grafico;

  let conteudo: ReactNode;
  if (partes === null) conteudo = <Aviso>Indisponível. A consulta falhou; tente novamente.</Aviso>;
  else if (soma === 0) conteudo = <Aviso>Nenhum registro ainda.</Aviso>;
  else if (grafico.tipo === "colunas") conteudo = <><Colunas partes={partes} soma={soma} /><RotulosColunas partes={partes} /></>;
  else if (grafico.tipo === "rosca") conteudo = <Rosca partes={partes} soma={soma} unidade="usuários" />;
  else if (grafico.tipo === "segmentado") conteudo = <Segmentado partes={partes} soma={soma} />;
  else conteudo = <Barras partes={partes} soma={soma} />;

  return <CartaoGrafico id={grafico.id} titulo={grafico.titulo} descricao={grafico.descricao} rodape={partes && soma > 0 ? `Total: ${numero.format(soma)}` : undefined}>
    {conteudo}
  </CartaoGrafico>;
}

const SERIES = [
  { chave: "usuarios", rotulo: "Novos usuários", curto: "Usuários", cor: CORES[0] },
  { chave: "itens", rotulo: "Novos itens", curto: "Itens", cor: CORES[1] },
] as const;

// Topo do eixo Y em um número "redondo" (1, 2, 5 ou 10 vezes uma potência de 10).
function escalaY(maior: number) {
  if (maior === 0) return { topo: 4, passo: 1 };
  const bruto = maior / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const normalizado = bruto / potencia;
  const passo = (normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10) * potencia;
  return { topo: Math.ceil(maior / passo) * passo, passo };
}

/** Linha: cadastros por mês, com uma linha por série no mesmo eixo. */
export function GraficoLinhaMensal({ serie }: { serie: MesAdmin[] | null }) {
  const descricao = "Usuários e itens cadastrados em cada um dos últimos meses";
  if (serie === null) {
    return <CartaoGrafico id="novos_por_mes" titulo="Novos cadastros por mês" descricao={descricao}>
      <Aviso>Indisponível. A consulta falhou; tente novamente.</Aviso>
    </CartaoGrafico>;
  }
  return <CartaoGrafico id="novos_por_mes" titulo="Novos cadastros por mês" descricao={descricao}>
    <PlotLinha serie={serie} />
  </CartaoGrafico>;
}

function PlotLinha({ serie }: { serie: MesAdmin[] }) {
  // O desenho usa a largura real do cartão, para o texto ficar em 12px no celular e no computador.
  const caixa = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(640);
  useEffect(() => {
    const elemento = caixa.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => setLargura(Math.max(260, Math.round(entrada.contentRect.width))));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const altura = 240;
  const margem = { topo: 16, direita: 72, base: 28, esquerda: 36 };
  const larguraUtil = largura - margem.esquerda - margem.direita;
  const alturaUtil = altura - margem.topo - margem.base;
  const { topo, passo } = escalaY(Math.max(...serie.flatMap((mes) => [mes.usuarios, mes.itens])));
  const x = (indice: number) => margem.esquerda + (serie.length === 1 ? larguraUtil / 2 : (indice * larguraUtil) / (serie.length - 1));
  const y = (valor: number) => margem.topo + alturaUtil - (valor / topo) * alturaUtil;
  const marcas = Array.from({ length: topo / passo + 1 }, (_, indice) => indice * passo);

  // Rótulo no fim de cada linha; se os dois ficarem colados, um sobe e o outro desce.
  const ultimo = serie.length - 1;
  const fins = SERIES.map((s) => y(serie[ultimo][s.chave]));
  if (Math.abs(fins[0] - fins[1]) < 14) {
    const meio = (fins[0] + fins[1]) / 2;
    const [acima, abaixo] = fins[0] <= fins[1] ? [0, 1] : [1, 0];
    fins[acima] = meio - 7;
    fins[abaixo] = meio + 7;
  }

  return <div ref={caixa} className="space-y-4">
    <ul className="flex flex-wrap gap-4 text-sm">
      {SERIES.map((s) => <li key={s.chave} className="flex items-center gap-2">
        <span aria-hidden="true" className="h-0.5 w-4 rounded-full" style={{ background: s.cor }} />
        <span className="text-foreground">{s.rotulo}</span>
      </li>)}
    </ul>
    <svg viewBox={`0 0 ${largura} ${altura}`} className="block h-auto w-full" aria-hidden="true">
      {marcas.map((marca) => <g key={marca}>
        <line x1={margem.esquerda} x2={largura - margem.direita} y1={y(marca)} y2={y(marca)} stroke={GRADE} strokeWidth="1" />
        <text x={margem.esquerda - 8} y={y(marca) + 4} textAnchor="end" className="fill-muted-foreground text-[12px] tabular-nums">{numero.format(marca)}</text>
      </g>)}
      {serie.map((mes, indice) => <text key={mes.mes} x={x(indice)} y={altura - 8} textAnchor="middle" className="fill-muted-foreground text-[12px]">{mes.rotulo}</text>)}
      {SERIES.map((s, indiceSerie) => <g key={s.chave}>
        <polyline
          fill="none"
          stroke={s.cor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={serie.map((mes, indice) => `${x(indice)},${y(mes[s.chave])}`).join(" ")}
        />
        {serie.map((mes, indice) => <g key={mes.mes}>
          <circle cx={x(indice)} cy={y(mes[s.chave])} r="4" fill={s.cor} stroke="white" strokeWidth="2" />
          {/* Área de toque maior que o ponto, com o valor no hover. */}
          <circle cx={x(indice)} cy={y(mes[s.chave])} r="12" fill="transparent" className="pointer-events-auto">
            <title>{`${s.rotulo} em ${mes.rotulo}: ${numero.format(mes[s.chave])}`}</title>
          </circle>
        </g>)}
        <text x={x(ultimo) + 10} y={fins[indiceSerie] + 4} className="fill-foreground text-[12px] font-semibold">{s.curto}</text>
      </g>)}
    </svg>
    {/* Mesmos dados em tabela para leitores de tela. */}
    <table className="sr-only">
      <caption>Novos cadastros por mês</caption>
      <thead><tr><th scope="col">Mês</th>{SERIES.map((s) => <th key={s.chave} scope="col">{s.rotulo}</th>)}</tr></thead>
      <tbody>{serie.map((mes) => <tr key={mes.mes}><th scope="row">{mes.rotulo}</th><td>{mes.usuarios}</td><td>{mes.itens}</td></tr>)}</tbody>
    </table>
  </div>;
}