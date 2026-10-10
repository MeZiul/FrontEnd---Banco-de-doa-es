"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function DashboardRefresh({ falhou }: { falhou: boolean }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  return <Button type="button" size="lg" disabled={pendente} aria-busy={pendente} onClick={() => startTransition(() => router.refresh())}>
    {pendente ? "Consultando…" : falhou ? "Tentar novamente" : "Atualizar indicadores"}
  </Button>;
}
