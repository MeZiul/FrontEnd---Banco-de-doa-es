"use client"

import { useState, useRef, useEffect, useId } from "react";
import { BotaoSair } from "@/components/auth/logout-button";
import Link from "next/link";

export default function UserDropdown({ usuario }: { usuario: { nome: string; email: string; perfil: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const iniciais = usuario.nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join("").toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        type="button"
        aria-label={`Conta de ${usuario.nome}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {iniciais}
      </button>

      {isOpen && (
        <div id={menuId} onKeyDown={event => { if (event.key === "Escape") { setIsOpen(false); dropdownRef.current?.querySelector("button")?.focus(); } }} className="absolute right-0 top-12 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 z-[100]">
          <div className="border-b border-gray-100 px-4 py-3 mb-2">
            <p className="text-sm font-semibold text-gray-900">{usuario.nome}</p>
            <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <Link href="/perfil/meus-anuncios" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
              Meus anúncios
            </Link>
            <Link href="/perfil/minhas-solicitacoes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
              Minhas solicitações
            </Link>
            <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
              Meu perfil público
            </Link>
            {usuario.perfil === "ADMINISTRADOR" && <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
              Administração
            </Link>}
          </div>
          
          <div className="border-t border-gray-100 pt-2 mt-2">
            <BotaoSair className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
}
