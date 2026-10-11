"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ErroAutenticacao({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  function tentarNovamente() {
    router.refresh();
    reset();
  }
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 text-foreground">
      <section role="alert" className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold">Não foi possível verificar sua sessão</h1>
        <p className="text-muted-foreground">Tente novamente em instantes para continuar com segurança.</p>
        <div className="flex flex-wrap gap-4">
          <button onClick={tentarNovamente} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">Tentar novamente</button>
          <Link href="/" className="rounded-lg border border-border px-4 py-2 font-semibold">Voltar ao início</Link>
        </div>
      </section>
    </main>
  );
}
