import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicHomeContent } from "@/components/home/public-home-content";
import { doacoesExemplo } from "@/stories/fixtures/doacoes";

const meta = {
  title: "Páginas/Home pública",
  component: PublicHomeContent,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PublicHomeContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComDoacoesDeExemplo: Story = { args: { items: doacoesExemplo } };
export const SemDoacoesPublicadas: Story = { args: { items: [] } };
export const FalhaAoCarregarFeed: Story = { args: { items: [], feedUnavailable: true } };
export const Celular: Story = { args: { items: doacoesExemplo }, globals: { viewport: { value: "mobile", isRotated: false } } };
