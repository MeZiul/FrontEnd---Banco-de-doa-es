"use client";
import { Button } from "@/components/ui/button";
export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
    <h1 className="text-2xl font-bold text-foreground">Área administrativa indisponível</h1>
    <p role="alert" className="text-muted-foreground">Não foi possível consultar os dados administrativos. Tente novamente em instantes.</p>
    <Button type="button" size="lg" onClick={retry}>Tentar novamente</Button>
  </main>;
}
