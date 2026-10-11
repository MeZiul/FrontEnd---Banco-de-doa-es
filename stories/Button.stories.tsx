import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@/components/ui/button';

const meta = { title: 'Componentes/Botão', component: Button, tags: ['autodocs'], args: { children: 'Tenho interesse' } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Principal: Story = {};
export const Secundario: Story = { args: { variant: 'outline', children: 'Voltar' } };
export const Indisponivel: Story = { args: { disabled: true, children: 'Enviando…' } };
export const AcaoDestrutiva: Story = { args: { variant: 'destructive', children: 'Remover foto' } };
