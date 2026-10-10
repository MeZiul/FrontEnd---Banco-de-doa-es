import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FeedPhoto } from '@/components/feed/feed-photo';

const meta = { title: 'Componentes/Foto da doação', component: FeedPhoto, tags: ['autodocs'], args: { titulo: 'Imagem demonstrativa', src: '/logo.png' }, decorators: [(Story) => <div className="max-w-sm"><Story /></div>] } satisfies Meta<typeof FeedPhoto>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ComImagem: Story = {};
export const SemImagem: Story = { args: { src: undefined } };
export const ImagemInvalida: Story = { args: { src: '/imagem-demonstrativa-inexistente.png' } };
