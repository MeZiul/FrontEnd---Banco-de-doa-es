"use client";

import { useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

type Props = {
    pagina: number;
    totalPaginas: number;
    aoMudarPagina: (pagina: number) => void;
};

export default function DataPagination({
    pagina,
    totalPaginas,
    aoMudarPagina,
}: Props) {
    const parametros = useSearchParams();

    if (totalPaginas <= 1) return null;

    function endereco(destino: number) {
        const novos = new URLSearchParams(parametros.toString());
        novos.set("pagina", String(destino));
        return `?${novos.toString()}`;
    }

    function aoClicar(
        evento: MouseEvent<HTMLAnchorElement>,
        destino: number
    ) {
        // Permite abrir em outra aba com Ctrl/Cmd+Click.
        if (
            evento.metaKey ||
            evento.ctrlKey ||
            evento.shiftKey ||
            evento.altKey
        ) {
            return;
        }

        evento.preventDefault();
        aoMudarPagina(destino);
    }

    const vizinhas = [pagina - 1, pagina, pagina + 1].filter(
        (numero) => numero >= 1 && numero <= totalPaginas
    );

    return (
        <Pagination>
            <PaginationContent>
                {pagina > 1 && (
                    <PaginationItem>
                        <PaginationPrevious
                            href={endereco(pagina - 1)}
                            onClick={(e) => aoClicar(e, pagina - 1)}
                        />
                    </PaginationItem>
                )}

                {pagina > 2 && (
                    <PaginationItem>
                        <PaginationLink
                            href={endereco(1)}
                            onClick={(e) => aoClicar(e, 1)}
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                )}

                {pagina > 3 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                {vizinhas.map((numero) => (
                    <PaginationItem key={numero}>
                        <PaginationLink
                            href={endereco(numero)}
                            onClick={(e) => aoClicar(e, numero)}
                            isActive={numero === pagina}
                            aria-current={numero === pagina ? "page" : undefined}
                        >
                            {numero}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {pagina < totalPaginas - 2 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                {pagina < totalPaginas - 1 && (
                    <PaginationItem>
                        <PaginationLink
                            href={endereco(totalPaginas)}
                            onClick={(e) => aoClicar(e, totalPaginas)}
                        >
                            {totalPaginas}
                        </PaginationLink>
                    </PaginationItem>
                )}

                {pagina < totalPaginas && (
                    <PaginationItem>
                        <PaginationNext
                            href={endereco(pagina + 1)}
                            onClick={(e) => aoClicar(e, pagina + 1)}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}
