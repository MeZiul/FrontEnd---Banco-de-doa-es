import { Search, Home, Package, Bell, Heart } from 'lucide-react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import UserDropdown from '@/components/layout/user-dropdown';
import { getUsuarioLogado, fetchApiAutenticado } from '@/lib/auth-server';
import { FeedRetry } from '@/components/feed/feed-retry';

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  let usuario;
  try { usuario = await getUsuarioLogado(); }
  catch (erro) {
    unstable_rethrow(erro);
    return <section role="alert" className="mx-auto my-8 max-w-xl rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">Não foi possível carregar sua conta</h1><p className="mt-2">Tente novamente em instantes.</p><FeedRetry /></section>;
  }
  let naoLidas: number | null = null;
  try {
    const contador = await fetchApiAutenticado<{ nao_lidas: number }>('notificacoes/contador', { signal: AbortSignal.timeout(10000) });
    if (Number.isSafeInteger(contador.nao_lidas) && contador.nao_lidas >= 0) naoLidas = contador.nao_lidas;
  } catch (erro) { unstable_rethrow(erro); }
  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-1 flex-col">
      <header className="sticky top-0 z-50 flex min-h-16 w-full flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2 md:px-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white"><Heart className="h-5 w-5 fill-current" aria-hidden="true" /></span><span className="text-xl font-bold tracking-tight text-blue-600">Doaí</span></Link>
        <form action="/" method="get" role="search" className="order-last flex w-full items-center md:order-none md:max-w-2xl md:flex-1 md:px-8">
          <label className="sr-only" htmlFor="busca-global">Buscar doações</label><div className="relative w-full"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input id="busca-global" name="busca" type="search" maxLength={200} placeholder="O que você está procurando?" className="h-10 w-full rounded-full border border-gray-200 bg-slate-50 pl-11 pr-4 text-sm" /></div><button type="submit" className="sr-only">Buscar</button>
        </form>
        <nav aria-label="Navegação da conta" className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="hover:text-blue-600" aria-label="Explorar doações"><Home className="h-6 w-6" aria-hidden="true" /></Link>
          <Link href="/perfil/meus-anuncios" className="hover:text-blue-600" aria-label="Meus anúncios"><Package className="h-6 w-6" aria-hidden="true" /></Link>
          <Link href="/perfil/notificacoes" className="relative hover:text-blue-600" aria-label={naoLidas === null ? 'Notificações: contador indisponível' : `Notificações: ${naoLidas} não lidas`}><Bell className="h-6 w-6" aria-hidden="true" />{naoLidas !== null && naoLidas > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{naoLidas > 99 ? '99+' : naoLidas}</span>}</Link>
          <UserDropdown usuario={{ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }} />
        </nav>
      </header>
      <div className="flex flex-1 w-full">{children}</div>
    </div>
  );
}
