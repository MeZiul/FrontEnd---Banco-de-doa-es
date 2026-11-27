"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Inbox, Pencil, Star, FileText, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BotaoSair } from "@/components/auth/logout-button";

const grupos = [
  {
    titulo: "Doações",
    itens: [
      {
        href: "/perfil/meus-anuncios",
        label: "Meus Anúncios",
        icon: Store
      },
      {
        href: "/perfil/minhas-solicitacoes",
        label: "Minhas Solicitações",
        icon: Inbox
      },
      {
        href: "/perfil/minhas-avaliacoes",
        label: "Minhas Avaliações",
        icon: Star
      }
    ]
  },
  {
    titulo: "Conta",
    itens: [
      {
        href: "/perfil/editar",
        label: "Editar Perfil",
        icon: Pencil
      },
      {
        href: "/perfil/termos",
        label: "Termos de Uso",
        icon: FileText
      }
    ]
  }
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
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:fixed md:bottom-0 md:left-0 md:top-16 md:z-40 md:w-64 md:overflow-y-auto">

      {/* Identificação do usuário */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
          {iniciais(nome)}
        </div>

        <div className="min-w-0 flex-1">
          <p
            title={nome}
            className="truncate text-sm font-semibold text-slate-900"
          >
            {nome}
          </p>

          <p
            title={email}
            className="truncate text-xs text-slate-500"
          >
            {email}
          </p>
        </div>
      </div>

      {/* Navegação do perfil */}
      <nav aria-label="Navegação do perfil" className="flex flex-1 flex-col">
        {grupos.map(({ titulo, itens }) => (
          <section key={titulo} className="mt-3 border-t border-slate-100 pt-4">
            <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {titulo}
            </h2>

            <div className="flex flex-col gap-1">
              {itens.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link key={href} href={href} aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />

                    <span className="flex-1">
                      {label}
                    </span>

                    {isActive && (
                      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Encerrar sessão */}
        <div className="mt-auto pt-6">
          <div className="border-t border-slate-100 pt-3">
            <BotaoSair
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              icone={<LogOut className="size-4 shrink-0" aria-hidden="true" />}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
}
