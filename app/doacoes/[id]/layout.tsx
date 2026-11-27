import type { ReactNode } from "react";
import { PublicSiteShell } from "@/components/home/public-site-shell";

export default function DetalhesDoacaoLayout({
    children
}: {
    children: ReactNode;
}) {
    return (
        <PublicSiteShell>
            {children}
        </PublicSiteShell>
    );
}