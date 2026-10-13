import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Página atual (começa em 1). */
  pagina: number;
  totalPaginas: number;
  /** Caminho da tela, ex.: "/perfil/minhas-solicitacoes". */
  caminho: string;
  /** Nome do parâmetro de página na URL. */
  parametro?: string;
  /** Texto para leitores de tela, ex.: "Paginação das solicitações". */
  rotulo?: string;
  /** Outros parâmetros que devem continuar na URL (ex.: filtro de status). */
  extras?: Record<string, string>;
};

// Paginação numerada para páginas renderizadas no servidor (Server Components).
// Usa links normais (?page=N), com o mesmo visual da paginação do admin:
// ‹ Anterior  1 … 4 [5] 6 … 9  Próxima ›
export function PaginacaoLinks({
  pagina,
  totalPaginas,
  caminho,
  parametro = "page",
  rotulo = "Paginação",
  extras = {},
}: Props) {
  if (totalPaginas <= 1) return null;

  const href = (destino: number) => `${caminho}?${new URLSearchParams({ ...extras, [parametro]: String(destino) })}`;
  const vizinhas = [pagina - 1, pagina, pagina + 1].filter((numero) => numero >= 1 && numero <= totalPaginas);
  const botao = (ativo = false) => buttonVariants({ variant: ativo ? "outline" : "ghost", size: "icon" });

  return (
    <nav aria-label={rotulo} className="mx-auto flex w-full justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-0.5">
        {pagina > 1 && (
          <li>
            <Link href={href(pagina - 1)} aria-label="Página anterior" className={cn(buttonVariants({ variant: "ghost" }), "pl-1.5")}>
              <ChevronLeftIcon />
              <span className="hidden sm:block">Anterior</span>
            </Link>
          </li>
        )}

        {pagina > 2 && (
          <li>
            <Link href={href(1)} className={botao()}>1</Link>
          </li>
        )}

        {pagina > 3 && (
          <li aria-hidden className="flex size-8 items-center justify-center">
            <MoreHorizontalIcon className="size-4" />
          </li>
        )}

        {vizinhas.map((numero) => (
          <li key={numero}>
            {numero === pagina ? (
              <span aria-current="page" className={botao(true)}>{numero}</span>
            ) : (
              <Link href={href(numero)} aria-label={`Página ${numero}`} className={botao()}>{numero}</Link>
            )}
          </li>
        ))}

        {pagina < totalPaginas - 2 && (
          <li aria-hidden className="flex size-8 items-center justify-center">
            <MoreHorizontalIcon className="size-4" />
          </li>
        )}

        {pagina < totalPaginas - 1 && (
          <li>
            <Link href={href(totalPaginas)} aria-label={`Página ${totalPaginas}`} className={botao()}>{totalPaginas}</Link>
          </li>
        )}

        {pagina < totalPaginas && (
          <li>
            <Link href={href(pagina + 1)} aria-label="Próxima página" className={cn(buttonVariants({ variant: "ghost" }), "pr-1.5")}>
              <span className="hidden sm:block">Próxima</span>
              <ChevronRightIcon />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
