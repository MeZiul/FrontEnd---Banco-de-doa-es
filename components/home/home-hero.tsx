import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export function HomeHero() {
  return (
    <section className="grid overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
        <p className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-950">Doações que continuam fazendo bem</p>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
          O que não serve mais para você pode ajudar alguém hoje.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Encontre itens doados na sua região ou compartilhe algo que ainda pode ter uma nova história.
        </p>
        <form action="/busca" method="get" role="search" aria-label="Buscar doações" className="mt-7 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
          <label htmlFor="busca-inicial" className="sr-only">O que você está procurando?</label>
          <span className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <Search className="size-5 shrink-0 text-blue-800" aria-hidden="true" />
            <input id="busca-inicial" name="busca" type="search" placeholder="Ex.: livros, cadeira, roupas" className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-700" />
          </span>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 motion-reduce:transition-none">
            Buscar doações <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold">
          <Link href="/doacoes/nova" className="text-blue-800 underline underline-offset-4 hover:text-blue-950">Quero anunciar uma doação</Link>
          <Link href="/ajuda" className="text-slate-700 underline underline-offset-4 hover:text-blue-800">Como funciona?</Link>
        </div>
      </div>
      <div className="relative mx-5 mb-5 flex min-h-64 items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#75b8cf] sm:mx-8 sm:mb-8 lg:mx-8 lg:my-8">
        <Image src="/images/caixa-doacao.png" alt="" width={640} height={640} priority className="h-auto max-h-[25rem] w-full max-w-[26rem] object-contain" sizes="(max-width: 1024px) 90vw, 40vw" />
        <p className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-blue-950 shadow-sm sm:bottom-6 sm:left-6 sm:text-sm">Cada objeto pode encontrar um novo destino.</p>
      </div>
    </section>
  );
}
