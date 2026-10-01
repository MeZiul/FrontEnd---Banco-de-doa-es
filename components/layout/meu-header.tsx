"use client";

import Image from "next/image";
import { Bell, ChevronDown, Home, Store, } from "lucide-react";

export default function Header() {
    return (
        <header className="h-[60px] w-full border-b border-gray-300 bg-[#216A9F]">
            <div className="relative flex h-full items-center justify-between px-7">

                <div className="flex items-center">
                    <div className="flex items-center">
                        <Image
                            src="/images/logo.png"
                            alt="Doaí"
                            width={80}
                            height={45}
                            priority
                            className="h-auto w-[80px] object-contain"
                        />
                    </div>
                </div>

                {/* Navegação central */}
                <nav className="absolute left-1/2 flex h-full -translate-x-1/2">

                    {/* Home */}
                    <button
                        className=" 
                        flex h-full w-[100px]
                        items-center justify-center
                        text-white
                        transition-colors
                        hover:bg-white/10
                        "
                    >
                        <Home
                            size={24}
                            strokeWidth={2.5}
                            fill="white"
                        />
                    </button>

                    {/* Loja - ativo */}
                    <button
                        className="
                        relative flex h-full w-[100px]
                        items-center justify-center
                        text-yellow-300
                        transition-colors
                        hover:bg-white/10
                        "
                    >
                        <Store
                            size={24}
                            strokeWidth={2.5}
                            fill="#FFD900"
                        />

                        {/* Indicador ativo */}
                        <span className="absolute bottom-0 left-0 h-[3px] w-full bg-yellow-300" />
                    </button>

                </nav>

                {/* Área do usuário */}
                <div className="ml-auto flex items-center gap-4">

                    {/* Notificação */}
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-white">
                        <Bell size={21} fill="white" />

                        {/* Badge */}
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                            1
                        </span>
                    </button>

                    {/* Avatar */}
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/30">
                        <Image
                            src="/images/avatar.jpg"
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Menu */}
                    <button className="text-white">
                        <ChevronDown size={18} />
                    </button>

                </div>
            </div>
        </header>
    );
}