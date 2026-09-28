

import Link from "next/link";
import { Package, Inbox, Star, FileText, LogOut, Edit3 } from "lucide-react";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full max-w-7xl mx-auto py-8 px-4 md:px-8 gap-8">
            {/* Área Principal (Os cards de Meus Anúncios vão renderizar aqui dentro) */}
            <div className="flex-1">
            {children}
            </div>
        </div>
    );
}
