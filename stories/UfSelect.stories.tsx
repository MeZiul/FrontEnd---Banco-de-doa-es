import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { UfSelect } from '@/components/shared/uf-select';

function Exemplo({ inicial = '' }: { inicial?: string }) {
  const [value, setValue] = useState(inicial);
  return <div className="max-w-xs space-y-2"><label htmlFor="uf-story">UF</label><UfSelect id="uf-story" value={value} onValueChange={setValue} placeholder="Selecione" /><p className="text-sm">Selecionado: {value || 'Nenhum'}</p></div>;
}
const meta = { title: 'Componentes/UF', component: Exemplo, tags: ['autodocs'] } satisfies Meta<typeof Exemplo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SemSelecao: Story = {};
export const Selecionado: Story = { args: { inicial: 'RO' } };
