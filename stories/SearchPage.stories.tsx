import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchPageContent } from "@/components/home/search-page-content";
import { filtrosDoacoesExemplo, resultadoDoacoesExemplo } from "@/stories/fixtures/doacoes";

const meta = {
  title: "Páginas/Busca de doações",
  component: SearchPageContent,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { filtros: filtrosDoacoesExemplo, resultado: resultadoDoacoesExemplo, categorias: [{ _id: "000000000000000000000101", nome: "Móveis" }, { _id: "000000000000000000000102", nome: "Livros" }] },
} satisfies Meta<typeof SearchPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComResultados: Story = {};
export const BuscaSemResultados: Story = { args: { filtros: { ...filtrosDoacoesExemplo, busca: "máquina do tempo" }, resultado: { ...resultadoDoacoesExemplo, docs: [], totalDocs: 0, totalPages: 0 }, categorias: [] } };
export const FalhaNaConsulta: Story = { args: { resultado: null } };
export const CategoriasIndisponiveis: Story = { args: { categorias: [], erroCategorias: true } };
export const Celular: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
