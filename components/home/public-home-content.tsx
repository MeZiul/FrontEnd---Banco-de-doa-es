import Link from "next/link";
import { ArrowRight, HandHeart, MapPin, Search } from "lucide-react";
import { fotoFeed } from "@/lib/feed";
import type { ItemFeed } from "@/types/feed";
import { ExpandableDonationCard } from "@/components/home/expandable-donation-card";
import { HomeHero } from "@/components/home/home-hero";

export function PublicHomeContent({ items, feedUnavailable = false }: { items: ItemFeed[]; feedUnavailable?: boolean }) {
  return (
    <div className="space-y-14 sm:space-y-16">
      <HomeHero />

      <section aria-labelledby="doacoes-recentes-titulo">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Compartilhadas pela comunidade</p>
            <h2 id="doacoes-recentes-titulo" className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Doações recentes</h2>
          </div>
          <Link href="/busca" className="inline-flex min-h-10 items-center gap-2 self-start font-semibold text-blue-800 underline underline-offset-4 hover:text-blue-950 sm:self-auto">
            Ver todas as doações <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {feedUnavailable ? (
          <div role="alert" className="rounded-3xl border border-amber-300 bg-amber-50 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-950">Não foi possível carregar as doações agora</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">Tente novamente em instantes. Você também pode abrir a busca e repetir a consulta.</p>
            <Link href="/" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">Tentar novamente</Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center sm:p-10">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sky-50 text-blue-800"><Search className="size-6" aria-hidden="true" /></div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">Ainda não há doações publicadas</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">Volte em breve ou anuncie um item que possa ajudar alguém da sua região.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/busca" className="inline-flex min-h-10 items-center rounded-lg border border-blue-800 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-sky-50">Abrir busca</Link>
              <Link href="/doacoes/nova" className="inline-flex min-h-10 items-center rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900">Anunciar doação</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.slice(0, 4).map(item => <ExpandableDonationCard key={item._id} item={item} src={fotoFeed(item)} />)}
          </div>
        )}
      </section>

      <section aria-labelledby="como-funciona-titulo" className="rounded-3xl bg-blue-950 px-6 py-8 text-white sm:px-9 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Simples e direto</p>
        <h2 id="como-funciona-titulo" className="mt-2 text-2xl font-bold sm:text-3xl">Compartilhar pode começar com um passo.</h2>
        <ol className="mt-7 grid gap-4 md:grid-cols-3">
          <li className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-amber-300"><Search className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 font-semibold">Encontre um item</h3>
            <p className="mt-2 text-sm leading-relaxed text-blue-100">Busque por nome, categoria e localização para descobrir o que está disponível.</p>
          </li>
          <li className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-amber-300"><HandHeart className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 font-semibold">Mostre seu interesse</h3>
            <p className="mt-2 text-sm leading-relaxed text-blue-100">Entre na sua conta e envie uma mensagem pelo anúncio.</p>
          </li>
          <li className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-amber-300"><MapPin className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 font-semibold">Combine com cuidado</h3>
            <p className="mt-2 text-sm leading-relaxed text-blue-100">Combine a retirada com a outra pessoa e escolha um local público e seguro.</p>
          </li>
        </ol>
        <Link href="/ajuda" className="mt-6 inline-flex min-h-10 items-center gap-2 font-semibold text-amber-300 underline underline-offset-4 hover:text-amber-200">
          Ver respostas e orientações <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
