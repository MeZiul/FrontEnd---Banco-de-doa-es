import type { Metadata } from "next";
import { PublicSiteShell } from "@/components/home/public-site-shell";
import { HelpCenter } from "@/components/help/help-center";

export const metadata: Metadata = { title: "Ajuda | Doaí", description: "Orientações para encontrar, anunciar e combinar uma doação com segurança." };

export default function AjudaPage() {
  return <PublicSiteShell><HelpCenter /></PublicSiteShell>;
}
