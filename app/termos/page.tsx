import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/legal-document";
import { termosSections } from "@/components/legal/legal-content";
import { PublicSiteShell } from "@/components/home/public-site-shell";

export const metadata: Metadata = { title: "Termos de Uso | Doaí", description: "Regras para publicar, encontrar e combinar doações na Doaí." };

export default function TermosPublicos() {
  return (
    <PublicSiteShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <LegalDocument
          title="Termos de Uso"
          updatedAt="11 de outubro de 2026"
          introduction="Leia as orientações para usar a plataforma e combinar doações com clareza e cuidado."
          sections={termosSections}
        />
        <p className="text-sm text-slate-600">Dúvidas de uso? Consulte a <Link href="/ajuda" className="font-semibold text-blue-800 underline underline-offset-4">Central de Ajuda</Link> ou leia a <Link href="/privacidade" className="font-semibold text-blue-800 underline underline-offset-4">Política de Privacidade</Link>.</p>
      </div>
    </PublicSiteShell>
  );
}
