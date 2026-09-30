
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Search, Home, Package, Bell, Heart } from 'lucide-react';
import Link from 'next/link';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import UserDropdown from '@/components/shared/UserDropdown';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Doaí - Conectando Pessoas e Doações',
  description: 'Plataforma de doações locais',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col`}>

        {/* HEADER */}
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 shadow-sm">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-600">Doaí</span>
          </Link>

          {/* Barra de Busca Global */}
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

          {/* Ações do Usuário e Notificações */}
          <div className="flex items-center gap-4 md:gap-6 text-gray-500">
            <button className="hover:text-blue-600 transition-colors" aria-label="Início">
              <Home className="h-[22px] w-[22px]" />
            </button>
            <button className="hover:text-blue-600 transition-colors" aria-label="Meus Anúncios">
              <Package className="h-[22px] w-[22px]" />
            </button>
            <button className="relative hover:text-blue-600 transition-colors" aria-label="Notificações">
              <Bell className="h-[22px] w-[22px]" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </button>

            {}
            <UserDropdown />
            
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <SidebarProvider className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex flex-1 flex-col">
            {/* Botão para esconder/mostrar o menu lateral */}
            <SidebarTrigger className="m-2" />
            {children}
          </main>
        </SidebarProvider>

      </body>
    </html>
  );
}