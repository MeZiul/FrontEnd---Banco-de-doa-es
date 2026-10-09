"use client";

import { useState, useTransition, type ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import { sair } from "@/app/(auth)/actions";

export function BotaoSair({ className, icone }: { className?: string; icone?: ReactNode }) {
  const [saindo, iniciarSaida] = useTransition();
  const [erroSaida, setErroSaida] = useState<string | null>(null);

  function encerrarSessao() {
    setErroSaida(null);
    iniciarSaida(async () => {
      try {
        const resultado = await sair();
        setErroSaida(resultado.erro);
      } catch (erro) {
        unstable_rethrow(erro);
        setErroSaida("Não foi possível encerrar a sessão. Tente novamente.");
      }
    });
  }

  return (
    <>
      {erroSaida && <p role="alert" className="px-3 py-2 text-sm text-red-600">{erroSaida}</p>}
      <button type="button" disabled={saindo} aria-busy={saindo} onClick={encerrarSessao} className={className}>
        {icone}
        {saindo ? "Saindo..." : "Sair"}
      </button>
    </>
  );
}
