"use client";
export default function ErroAnuncios({ reset }: { reset: () => void }) {
  return <div className="rounded-2xl border bg-white p-6"><p role="alert">Não foi possível carregar seus anúncios.</p><button onClick={reset} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white">Tentar novamente</button></div>;
}
