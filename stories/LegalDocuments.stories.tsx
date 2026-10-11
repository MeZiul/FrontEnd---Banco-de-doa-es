import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LegalDocument } from "@/components/legal/legal-document";
import { privacidadeSections, termosSections } from "@/components/legal/legal-content";

const meta = {
  title: "Páginas/Documentos legais",
  component: LegalDocument,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { title: "Termos de Uso", updatedAt: "11 de outubro de 2026", introduction: "Orientações sobre o uso da plataforma.", sections: termosSections },
} satisfies Meta<typeof LegalDocument>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Termos: Story = {};
export const Privacidade: Story = { args: { title: "Política de Privacidade", introduction: "Informações sobre os dados tratados pelas funcionalidades atuais.", sections: privacidadeSections } };
