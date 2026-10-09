"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Flag, ClipboardList } from "lucide-react";

const links = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/usuarios",
    label: "Usuários",
    icon: Users,
  },
  {
    href: "/admin/denuncias",
    label: "Denúncias",
    icon: Flag,
  },
  {
    href: "/admin/auditoria",
    label: "Auditoria",
    icon: ClipboardList,
  },
];

export function AdminSidebar({
  recolhida = false
}: {
  recolhida?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col gap-1"
      aria-label="Menu administrativo"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const ativo = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            title={recolhida ? label : undefined}
            aria-label={label}
            aria-current={ativo ? "page" : undefined}
            className={`
              flex h-10 items-center rounded-lg
              text-sm transition-colors
              ${recolhida ? "justify-center px-2" : "gap-3 px-3"}
              ${ativo ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-100"}
            `}
          >
            <Icon className="h-5 w-5 shrink-0" />

            {!recolhida && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
