import { 
  ShoppingBasket, 
  Shirt, 
  Armchair, 
  WashingMachine, 
  Printer, 
  Baby, 
  Search 
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  return (
    <Sidebar className="bg-[#D6EBFF] border-r-0">
      
      {/* Cabeçalho da Sidebar (Busca e Botão) */}
      <SidebarHeader className="p-5">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Explorar</h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar..." 
            className="pl-9 bg-white border-none shadow-sm rounded-full h-10" 
          />
        </div>
        
        <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-md font-bold py-5">
          + Faça uma doação
        </Button>
      </SidebarHeader>

      {/* Conteúdo da Sidebar (Categorias) */}
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-800 font-bold text-sm mb-2">
            Categorias
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
                    <ShoppingBasket className="w-5 h-5" />
                    <span>Alimentos e Cestas Básicas</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
                    <Shirt className="w-5 h-5" />
                    <span>Roupas e Calçados</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
                    <Armchair className="w-5 h-5" />
                    <span>Móveis e Decoração</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
                    <WashingMachine className="w-5 h-5" />
                    <span>Eletrodomésticos</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
                    <Printer className="w-5 h-5" />
                    <span>Eletrônicos</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
                    <Baby className="w-5 h-5" />
                    <span>Infantil e Brinquedos</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  )
}