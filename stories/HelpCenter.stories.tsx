import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HelpCenter } from "@/components/help/help-center";

const meta = {
  title: "Páginas/Central de ajuda",
  component: HelpCenter,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HelpCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerguntasFechadas: Story = {};
export const Celular: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
