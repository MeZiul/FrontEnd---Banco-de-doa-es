"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CategoriaFeed } from "@/types/feed"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/busca", label: "Explorar tudo", icon: Compass },
  { href: "/perfil", label: "Sua conta", icon: UserRound },
]

const defaultCategories = [
  "Alimentos",
  "Roupas",
  "Móveis",
  "Eletrodomésticos",
  "Livros e Estudos",
  "Brinquedos",
  "Higiene",
  "Outros",
]

function iconForCategory(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR")
  if (normalized.includes("alimento")) return Apple
  if (normalized.includes("roup")) return Shirt
  if (normalized.includes("move")) return Armchair
  if (normalized.includes("eletrodom")) return Refrigerator
  if (normalized.includes("livr") || normalized.includes("estud")) return BookOpen
  if (normalized.includes("brinqued")) return ToyBrick
  if (normalized.includes("higiene")) return Sparkles
  return Package
}

function categoryHref(id: string) {
  const params = new URLSearchParams({ categoria_id: id })
  return `/busca?${params.toString()}`
}

type AppSidebarProps = {
  categorias?: CategoriaFeed[]
  className?: string
  locationIllustrative?: boolean
}

export function AppSidebar({ categorias, className, locationIllustrative = false }: AppSidebarProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const closeMobile = () => setOpenMobile(false)
  const usesDefaultCategories = categorias === undefined
  const categoryOptions = usesDefaultCategories
    ? defaultCategories.map(nome => ({ nome, _id: undefined }))
    : categorias

  return (
    <Sidebar
      variant="floating"
      collapsible="offcanvas"
      className={cn("border-none", className)}
    >
      <SidebarHeader className="gap-6 px-4 pt-4">
        {/* Busca */}
        <form action="/busca" method="get" role="search" aria-label="Buscar doações" className="relative">
          <label htmlFor="busca-lateral" className="sr-only">Buscar doações</label>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="busca-lateral"
            name="busca"
            type="search"
            maxLength={200}
            placeholder="Buscar doações"
            className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="sr-only">Buscar</button>
        </form>

        {/* Navegação principal */}
        <div className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/busca"
              ? pathname === "/" || pathname.startsWith("/busca")
              : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
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
        <Link href="/doacoes/nova" onClick={closeMobile} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-yellow-400 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Faça uma doação
        </Link>
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
              <Slider
                aria-label={locationIllustrative ? "Raio ilustrativo da busca" : "Raio da busca"}
                disabled={locationIllustrative}
                defaultValue={[50]}
                max={100}
                step={1}
                className="py-1"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {locationIllustrative ? "Raio ilustrativo de 50 km" : "Raio de 50 km"}
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
              {categoryOptions.map((categoria) => {
                const Icon = iconForCategory(categoria.nome)
                return (
                  <li key={categoria._id ?? categoria.nome}>
                    <Link
                      href={categoria._id ? categoryHref(categoria._id) : usesDefaultCategories ? "/" : "/busca"}
                      onClick={closeMobile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Icon aria-hidden="true" className="size-4 shrink-0" />
                      <span className="min-w-0 truncate">{categoria.nome}</span>
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
