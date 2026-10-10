"use client";
import Link from "next/link";

export default function ErroDetalhes({ retry }: { retry: () => void }) {
  return <main className="mx-auto max-w-5xl space-y-4 px-5 py-8"><h1 className="text-2xl font-bold">Detalhes da doação</h1><p role="alert">Não foi possível exibir este anúncio. Tente novamente em instantes.</p><button onClick={retry} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Tentar novamente</button><Link href="/" className="block text-blue-700 underline">Voltar às doações</Link></main>;
}
