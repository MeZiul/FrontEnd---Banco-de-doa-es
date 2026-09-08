"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Apple,
  Armchair,
  BookOpen,
  Compass,
  MapPin,
  Package,
  Plus,
  Refrigerator,
  Search,
  Shirt,
  Sparkles,
  ToyBrick,
  UserRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const icons: Record<string, typeof Apple> = {
  Apple,
  Shirt,
  Armchair,
  Refrigerator,
  BookOpen,
  ToyBrick,
  Sparkles,
  Package,
}

const categories = [
  { slug: "alimentos", label: "Alimentos", icon: "Apple" },
  { slug: "roupas", label: "Roupas", icon: "Shirt" },
  { slug: "moveis", label: "Móveis", icon: "Armchair" },
  { slug: "eletrodomesticos", label: "Eletrodomésticos", icon: "Refrigerator" },
  { slug: "livros-e-estudos", label: "Livros e Estudos", icon: "BookOpen" },
  { slug: "brinquedos", label: "Brinquedos", icon: "ToyBrick" },
  { slug: "higiene", label: "Higiene", icon: "Sparkles" },
  { slug: "outros", label: "Outros", icon: "Package" },
]

const nav = [
  { href: "/", label: "Explorar tudo", icon: Compass },
  { href: "/conta", label: "Sua conta", icon: UserRound },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="offcanvas" className="border-none">
      <SidebarHeader className="gap-6 px-4 pt-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar doações"
            className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Navegação principal */}
        <div className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/10"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Botão de doação */}
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-yellow-400 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500">
          <Plus className="h-4 w-4" />
          Faça uma doação
        </button>
      </SidebarHeader>

      <SidebarContent className="gap-6 px-4 pb-4">
        {/* Localização */}
        <SidebarGroup className="space-y-3 p-0">
          <SidebarGroupLabel className="px-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Localização
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 truncate">Vilhena - RO</span>
            </div>
            <div className="px-1">
              <Slider defaultValue={[50]} max={100} step={1} className="py-1" />
              <span className="mt-1 block text-xs text-muted-foreground">
                Raio de 50 km
              </span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categorias */}
        <SidebarGroup className="space-y-2 p-0">
          <SidebarGroupLabel className="px-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categorias
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="space-y-1">
              {categories.map((c) => {
                const Icon = icons[c.icon] ?? Package
                return (
                  <li key={c.slug}>
                    <Link
                      href="/"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="min-w-0 truncate">{c.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}