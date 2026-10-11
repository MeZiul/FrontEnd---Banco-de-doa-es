import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedPhoto } from '@/components/feed/feed-photo';

const exemplos = [{ titulo: 'Cadeira para estudo', categoria: 'Móveis' }, { titulo: 'Livros de literatura', categoria: 'Livros' }];
function FeedVisual({ estado = 'pronto' }: { estado?: 'pronto' | 'vazio' | 'erro' | 'carregando' }) {
  const [busca, setBusca] = useState('');
  const itens = estado === 'vazio' ? [] : exemplos.filter(item => item.titulo.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')));
  return <main className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2 text-2xl font-bold text-blue-700 dark:text-blue-300"><Heart aria-hidden="true" />Doaí</div><Button variant="outline" disabled>Conta demonstrativa</Button></header>
    <div><h1 className="text-3xl font-bold">Encontre uma doação</h1><p className="text-muted-foreground">Composição visual com dados fictícios. Nenhum envio para a API.</p></div>
    <div className="space-y-2"><label htmlFor="busca-story">Buscar doações</label><Input id="busca-story" value={busca} onChange={event => setBusca(event.target.value)} placeholder="Título da doação" /></div>
    {estado === 'erro' ? <div role="alert" className="rounded-xl border p-5">Não foi possível carregar as doações. <Button variant="outline" disabled>Tentar novamente (exemplo)</Button></div> : estado === 'carregando' ? <div role="status" aria-label="Carregando doações" className="grid gap-5 sm:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div> : itens.length === 0 ? <p role="status">Nenhuma doação encontrada.</p> : <div className="grid gap-5 sm:grid-cols-2">{itens.map(item => <Card key={item.titulo} className="overflow-hidden pt-0"><FeedPhoto titulo={item.titulo} /><CardContent className="space-y-3"><h2 className="text-xl font-semibold">{item.titulo}</h2><p>{item.categoria}</p><p className="flex items-center gap-1 text-sm"><MapPin className="size-4" aria-hidden="true" />Vilhena, RO</p><Button disabled>Ver detalhes (exemplo)</Button></CardContent></Card>)}</div>}
  </main>;
}
const meta = { title: 'Páginas/Feed', component: FeedVisual, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof FeedVisual>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ComDoacoes: Story = {};
export const Vazio: Story = { args: { estado: 'vazio' } };
export const Erro: Story = { args: { estado: 'erro' } };
export const Carregando: Story = { args: { estado: 'carregando' } };
export const Celular: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } };
