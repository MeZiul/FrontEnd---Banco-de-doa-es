import Link from "next/link";
import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { AccountNavigation } from "@/components/layout/account-navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { CategoriaFeed } from "@/types/feed";

type PublicSiteShellProps = {
  children: ReactNode;
  exploreSidebar?: boolean;
  categorias?: CategoriaFeed[];
};

export function PublicSiteShell({ children, exploreSidebar = false, categorias = [] }: PublicSiteShellProps) {
  const shell = (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-blue-800 focus:shadow-lg">
        Ir para o conteúdo principal
      </a>
      <header className={exploreSidebar ? "sticky top-0 z-40 min-h-20 border-b border-slate-200 bg-white" : "border-b border-slate-200 bg-white"}>
        <nav aria-label="Navegação principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {exploreSidebar && <SidebarTrigger aria-label="Abrir ou fechar menu de exploração" title="Abrir ou fechar menu de exploração" />}
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-800">
              <span className="grid size-10 place-items-center rounded-2xl bg-blue-800 text-white">
                <Heart className="size-5 fill-current" aria-hidden="true" />
              </span>
              Doaí
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold">
            <Link href="/busca" className="text-slate-700 underline-offset-4 hover:text-blue-800 hover:underline">Explorar doações</Link>
            <Link href="/ajuda" className="text-slate-700 underline-offset-4 hover:text-blue-800 hover:underline">Ajuda</Link>
            <AccountNavigation />
          </div>
        </nav>
      </header>
      {exploreSidebar ? (
        <div className="mx-auto flex w-full max-w-7xl flex-1">
          <AppSidebar
            categorias={categorias}
            locationIllustrative
            className="md:sticky! md:top-20! md:bottom-auto! md:left-auto! md:right-auto! md:h-[calc(100svh-5rem)]! md:self-start! group-data-[collapsible=offcanvas]:hidden!"
          />
          <main id="conteudo" className="min-w-0 w-full flex-1 px-5 py-8 sm:py-10">
            {children}
          </main>
        </div>
      ) : (
        <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:py-10">
          {children}
        </main>
      )}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Doaí · Um novo caminho para o que ainda pode ser útil.</p>
          <nav aria-label="Informações e ajuda" className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            <Link href="/ajuda" className="text-blue-800 underline-offset-4 hover:underline">Ajuda</Link>
            <Link href="/termos" className="text-blue-800 underline-offset-4 hover:underline">Termos de uso</Link>
            <Link href="/privacidade" className="text-blue-800 underline-offset-4 hover:underline">Privacidade</Link>
          </nav>
        </div>
      </footer>
    </div>
  );

  return exploreSidebar
    ? <SidebarProvider className="flex-col">{shell}</SidebarProvider>
    : shell;
}
