export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Carregando doações" className="mx-auto w-full max-w-7xl space-y-6 px-5 py-10">
      <p role="status" className="text-lg font-semibold">Carregando doações…</p>
      <div aria-hidden="true" className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}
      </div>
    </main>
  );
}
