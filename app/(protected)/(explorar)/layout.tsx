import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default function ExplorarLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider className="flex flex-1 w-full">
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        {/* Botão para esconder/mostrar o menu lateral */}
        <SidebarTrigger className="m-2" />
        {children}
      </main>
    </SidebarProvider>
  );
}