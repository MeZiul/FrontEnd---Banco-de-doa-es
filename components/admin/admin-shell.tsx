"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recolhida, setRecolhida] = useState(false);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1">
      <aside className={`
          sticky top-16 hidden
          h-[calc(100dvh-4rem)]
          shrink-0 flex-col
          border-r bg-white
          transition-[width] duration-200
          md:flex
          ${recolhida ? "w-16" : "w-60"}
        `}>

        <div className={`flex h-16 items-center border-b px-3 ${recolhida ? "justify-center" : "justify-between"}`} >
          {!recolhida && (
            <span className="text-sm font-semibold"> Administração </span>
          )}

          <Button variant="ghost" size="icon" aria-label={
            recolhida ? "Expandir menu" : "Recolher menu"
          }
            aria-expanded={!recolhida}
            onClick={() => setRecolhida(!recolhida)}
          >
            {recolhida ?
              (<PanelLeftOpen className="h-5 w-5" />) :
              (<PanelLeftClose className="h-5 w-5" />)
            }
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <AdminSidebar recolhida={recolhida} />
        </div>
      </aside>

      <main className="flex min-h-[calc(100dvh-4rem)] min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
