export default function BuscaLoading() {
  return (
    <main aria-label="Carregando busca de doações" className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-5 py-8 sm:py-10">
      <div role="status" className="space-y-3">
        <span className="sr-only">Carregando resultados da busca</span>
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="h-9 w-full max-w-xl animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      </div>
      <div aria-hidden="true" className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-12 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none sm:col-span-2 lg:col-span-3" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
      </div>
    </main>
  );
}
