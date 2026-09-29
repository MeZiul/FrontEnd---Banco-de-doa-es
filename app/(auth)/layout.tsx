import { Search, Home, Package, Bell, Heart } from "lucide-react";
import Link from "next/link";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import UserDropdown from "@/components/shared/UserDropdown";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col">

      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 shadow-sm">

        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <Heart className="h-5 w-5 fill-current" />
          </div>

          <span className="text-xl font-bold tracking-tight text-blue-600">
            Doaí
          </span>
        </Link>

        <div className="hidden max-w-2xl flex-1 items-center px-8 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="O que você está procurando?"
              className="h-10 w-full rounded-full border border-transparent bg-gray-100 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-500 md:gap-6">

          <button
            className="transition-colors hover:text-blue-600"
            aria-label="Início"
          >
            <Home className="h-[22px] w-[22px]" />
          </button>

          <button
            className="transition-colors hover:text-blue-600"
            aria-label="Meus Anúncios"
          >
            <Package className="h-[22px] w-[22px]" />
          </button>

          <button
            className="relative transition-colors hover:text-blue-600"
            aria-label="Notificações"
          >
            <Bell className="h-[22px] w-[22px]" />

            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              3
            </span>
          </button>

          <UserDropdown />

        </div>
      </header>

      <SidebarProvider className="flex w-full flex-1">

        <AppSidebar />

        <main className="flex flex-1 flex-col">

          <SidebarTrigger className="m-2" />

          {children}

        </main>

      </SidebarProvider>
    </div>
  );
}