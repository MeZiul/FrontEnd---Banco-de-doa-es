import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/legal-document";
import { privacidadeSections } from "@/components/legal/legal-content";
import { PublicSiteShell } from "@/components/home/public-site-shell";

export const metadata: Metadata = { title: "Política de Privacidade | Doaí", description: "Entenda quais informações a Doaí utiliza e como aparecem nas funcionalidades do projeto." };

export default function Privacidade() {
  return (
    <PublicSiteShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <LegalDocument
          title="Política de Privacidade"
          updatedAt="11 de outubro de 2026"
          introduction="Este aviso apresenta quais informações as funcionalidades atuais tratam e como você pode cuidar do que publica."
          sections={privacidadeSections}
        />
        <p className="text-sm text-slate-600">Veja também os <Link href="/termos" className="font-semibold text-blue-800 underline underline-offset-4">Termos de Uso</Link> e as orientações da <Link href="/ajuda" className="font-semibold text-blue-800 underline underline-offset-4">Central de Ajuda</Link>.</p>
      </div>
    </PublicSiteShell>
  );
}
