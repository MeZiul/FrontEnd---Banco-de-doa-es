import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { CategoriaFeed } from "@/types/feed";

const categoriasDeExemplo: CategoriaFeed[] = [
  { _id: "000000000000000000000101", nome: "Alimentos" },
  { _id: "000000000000000000000102", nome: "Roupas" },
  { _id: "000000000000000000000103", nome: "Móveis" },
  { _id: "000000000000000000000104", nome: "Eletrodomésticos" },
  { _id: "000000000000000000000105", nome: "Livros e Estudos" },
  { _id: "000000000000000000000106", nome: "Brinquedos" },
  { _id: "000000000000000000000107", nome: "Higiene" },
  { _id: "000000000000000000000108", nome: "Outros" },
];

function SidebarShowcase({ categorias = categoriasDeExemplo }: { categorias?: CategoriaFeed[] }) {
  return (
    <SidebarProvider className="flex-col">
      <header className="sticky top-0 z-40 flex min-h-20 items-center gap-3 border-b bg-white px-5">
        <SidebarTrigger aria-label="Abrir ou fechar menu de exploração" title="Abrir ou fechar menu de exploração" />
        <span className="text-lg font-semibold">Doaí · Explorar</span>
      </header>
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl">
        <AppSidebar
          categorias={categorias}
          locationIllustrative
          className="md:sticky! md:top-20! md:bottom-auto! md:left-auto! md:right-auto! md:h-[calc(100svh-5rem)]! md:self-start! group-data-[collapsible=offcanvas]:hidden!"
        />
        <main className="min-w-0 flex-1 px-5 py-8">
          <h1 className="text-2xl font-bold">Explore doações</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Esta área demonstra a barra lateral e seu acionador nos tamanhos desktop e celular.</p>
        </main>
      </div>
    </SidebarProvider>
  );
}

const meta = {
  title: "Componentes/Barra lateral de exploração",
  component: SidebarShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/busca" } },
  },
} satisfies Meta<typeof SidebarShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Celular: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
