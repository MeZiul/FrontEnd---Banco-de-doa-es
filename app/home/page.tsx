import { Package } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

// Mock de dados baseado na sua imagem
const anunciosMock = [
  { id: 1, titulo: "Mesa de madeira sem cadeiras", destaque: true, img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80" },
  { id: 2, titulo: "Livros", destaque: false, img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80" },
  { id: 3, titulo: "Suporte para monitor", destaque: false, img: "https://images.unsplash.com/photo-1587825140708-1228cd61864e?w=500&q=80" },
  { id: 4, titulo: "Violão", destaque: false, img: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&q=80" },
  { id: 5, titulo: "Cadeira com suporte para braço", destaque: false, img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80" },
]

export default function HomePage() {
  return (
    <div className="p-6 md:p-8 h-full">
      
      {/* Container principal usando Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        
        {anunciosMock.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 cursor-pointer group">
            
            {/* 1. CONTAINER DA IMAGEM */}
            <div className={`overflow-hidden rounded-xl border-[3px] transition-all ${
              item.destaque 
                ? 'border-[#3b82f6]' // Borda azul para o item em destaque
                : 'border-transparent group-hover:border-gray-200'
            }`}>
              
              <AspectRatio ratio={1 / 1}>
                <img
                  src={item.img}
                  alt={item.titulo}
                  className="object-cover w-full h-full bg-gray-100"
                />
              </AspectRatio>
              
            </div>

            {/* 2. INFORMAÇÕES DO ANÚNCIO */}
            <div className="flex flex-col gap-1 px-1">
              <h3 className="font-extrabold text-sm leading-tight text-gray-900 line-clamp-2">
                {item.titulo}
              </h3>
              
              <div className="flex items-center gap-1 text-[13px] font-medium text-gray-700 mt-1">
                <Package className="w-4 h-4" />
                <span>Retirada</span>
              </div>
              
              <span className="text-[12px] text-gray-500">
                Vilhena/RO
              </span>
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}