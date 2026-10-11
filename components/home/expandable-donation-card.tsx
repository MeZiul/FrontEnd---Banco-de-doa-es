"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { FeedPhoto } from "@/components/feed/feed-photo";
import { CONDICOES, type ItemFeed } from "@/types/feed";

export function ExpandableDonationCard({ item, src, defaultExpanded = false }: { item: ItemFeed; src?: string; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const detailsId = useId();
  const local = [item.cidade, item.uf].filter(Boolean).join(" / ") || "Localização não informada";

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md motion-reduce:transition-none">
      <FeedPhoto src={src} titulo={item.titulo} />
      <div className="space-y-3 p-4 sm:p-5">
        <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-blue-900">{item.categoria_id?.nome || "Doação"}</p>
        <h3 className="break-words text-lg font-bold leading-snug text-slate-950">{item.titulo}</h3>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={`${expanded ? "Ocultar" : "Ver"} detalhes de ${item.titulo}`}
          onClick={() => setExpanded(value => !value)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-blue-800 underline underline-offset-4 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
        >
          {expanded ? "Ocultar detalhes" : "Ver detalhes"}
          {expanded ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
        </button>
        <div
          id={detailsId}
          aria-hidden={!expanded}
          inert={!expanded}
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-950">Condição:</span> {CONDICOES[item.condicao_item] ?? "Não informada"}</p>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-blue-800" aria-hidden="true" /><span><span className="font-semibold text-slate-950">Localização:</span> {local}</span></p>
              <Link href={`/doacoes/${item._id}`} className="inline-flex min-h-10 items-center font-semibold text-blue-800 underline underline-offset-4 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">
                Abrir anúncio completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
