"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GraficoDistribuicao, GraficoLinhaMensal } from "@/components/admin/graficos-dashboard";
import { Card } from "@/components/ui/card";
import { montarDashboardAdmin, type DashboardAdmin } from "@/lib/admin-metrics";
import { cn } from "@/lib/utils";

type Estado = "conectando" | "ao-vivo" | "reconectando" | "pausado";

const TEXTO_ESTADO: Record<Estado, string> = {
  conectando: "Conectando à atualização automática…",
  "ao-vivo": "Ao vivo",
  reconectando: "Reconectando…",
  pausado: "Atualização automática pausada. Use Atualizar indicadores.",
};

export function MetricasAoVivo({ inicial }: { inicial: DashboardAdmin }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("conectando");
  const [aoVivo, setAoVivo] = useState<{ dashboard: DashboardAdmin; em: Date } | null>(null);

  useEffect(() => {
    let fonte: EventSource | null = null;

    const abrir = () => {
      fonte?.close();
      const atual = new EventSource("/api/admin/metricas/stream");
      fonte = atual;
      atual.addEventListener("metricas", (evento) => {
        try {
          setAoVivo({ dashboard: montarDashboardAdmin(JSON.parse(evento.data)), em: new Date() });
          setEstado("ao-vivo");
        } catch {
          // Evento malformado: mantém os últimos números válidos.
        }
      });
      atual.onerror = () => {
        if (atual.readyState === EventSource.CONNECTING) {
          // Queda ou fim dos 10 min do back: o navegador reconecta sozinho.
          setEstado("reconectando");
          return;
        }
        // 401/403/429/502 fecham o EventSource. O refresh deixa o servidor redirecionar se o acesso caiu.
        setEstado("pausado");
        setAoVivo(null);
        router.refresh();
      };
    };

    // Aba escondida libera a conexão (o back aceita no máximo 3 por conta).
    const aoMudarVisibilidade = () => {
      if (document.hidden) {
        fonte?.close();
        fonte = null;
      } else if (!fonte || fonte.readyState === EventSource.CLOSED) {
        setEstado("conectando");
        abrir();
      }
    };

    if (!document.hidden) abrir();
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () => {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      fonte?.close();
    };
  }, [router]);

  const { metricas, graficos, serie } = aoVivo?.dashboard ?? inicial;
  const falhou = metricas.some((metrica) => metrica.total === null);
  const vazio = metricas.every((metrica) => metrica.total === 0);

  return <>
    <p data-test="estadoAoVivo" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span aria-hidden="true" className={cn(
        "size-2 rounded-full",
        estado === "ao-vivo" ? "bg-emerald-500" : estado === "pausado" ? "bg-muted-foreground" : "bg-amber-500 motion-safe:animate-pulse",
      )} />
      <span role="status">{TEXTO_ESTADO[estado]}</span>
      {estado === "ao-vivo" && aoVivo && <span>· atualizado às {aoVivo.em.toLocaleTimeString("pt-BR")}</span>}
    </p>
    {falhou && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Não foi possível consultar todos os indicadores. As contagens disponíveis estão abaixo. Tente novamente para atualizar.
    </p>}
    {vazio && <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Ainda não há cadastros, itens ou denúncias para acompanhar.</p>}
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {metricas.map((metrica) => <Card key={metrica.id} data-metrica={metrica.id} className="gap-1 px-4 py-3">
        {/* Duas linhas reservadas na faixa de 6 colunas, para os números ficarem alinhados. */}
        <dt className="text-xs font-semibold text-muted-foreground xl:min-h-8">{metrica.titulo}</dt>
        <dd className="text-2xl font-bold tabular-nums text-primary">
          {metrica.total === null ? <span className="text-sm font-semibold text-muted-foreground">Indisponível</span> : metrica.total.toLocaleString("pt-BR")}
        </dd>
        <p className="text-xs leading-snug text-muted-foreground">{metrica.total === null ? "A consulta falhou." : metrica.descricao}</p>
      </Card>)}
    </dl>
    <section aria-labelledby="titulo-distribuicao" className="space-y-4">
      <h2 id="titulo-distribuicao" className="text-lg font-semibold text-foreground">Visão geral</h2>
      <GraficoLinhaMensal serie={serie} />
      <div className="grid gap-4 lg:grid-cols-2">
        {graficos.map((grafico) => <GraficoDistribuicao key={grafico.id} grafico={grafico} />)}
      </div>
    </section>
  </>;
}