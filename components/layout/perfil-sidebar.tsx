"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Inbox, Pencil, Star, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { BotaoSair } from "@/components/auth/logout-button";

const nav = [
  { href: "/perfil/meus-anuncios", label: "Meus Anúncios", icon: Store },
  { href: "/perfil/minhas-solicitacoes", label: "Minhas Solicitações", icon: Inbox },
  { href: "/perfil/editar", label: "Editar Perfil", icon: Pencil },
  { href: "/perfil/minhas-avaliacoes", label: "Minhas Avaliações", icon: Star },
  { href: "/perfil/termos", label: "Termos de Uso", icon: FileText },
];

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

type PerfilSidebarProps = {
  nome: string;
  email: string;
};

export function PerfilSidebar({ nome, email }: PerfilSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 rounded-2xl bg-white p-3 shadow-sm md:w-60">
      {/* Usuário */}
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {iniciais(nome)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{nome}</p>
          <p className="truncate text-xs text-gray-500">{email}</p>
        </div>
      </div>

      {/* Navegação do perfil */}
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-full px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100",
                isActive && "bg-blue-50 font-medium text-blue-700 hover:bg-blue-50"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        <BotaoSair
          className="flex items-center gap-3 rounded-full px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          icone={<LogOut className="size-4 shrink-0" />}
        />
      </nav>
    </aside>
  );
}
