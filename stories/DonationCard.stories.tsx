import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ExpandableDonationCard } from "@/components/home/expandable-donation-card";
import { doacoesExemplo } from "@/stories/fixtures/doacoes";

const meta = {
  title: "Doações/Cartão expansível",
  component: ExpandableDonationCard,
  tags: ["autodocs"],
  args: { item: doacoesExemplo[0] },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof ExpandableDonationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recolhido: Story = {};
export const DetalhesAbertos: Story = { args: { item: doacoesExemplo[0], defaultExpanded: true } };
export const FotoIndisponivel: Story = { args: { item: { ...doacoesExemplo[0], titulo: "Livro sem foto" } } };
