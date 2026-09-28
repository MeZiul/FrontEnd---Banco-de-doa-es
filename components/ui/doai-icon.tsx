import { Square, Heart } from 'lucide-react';

export function DoaiIconCustom() {
  return (
    <div className="flex items-center gap-2">
      {/* Contêiner do ícone composto */}
      <div className="relative flex items-center justify-center w-8 h-8">
        {/* Quadrado de fundo amarelo */}
        <Square 
          className="absolute w-full h-full text-amber-400 fill-amber-400" 
          strokeWidth={0} 
        />
        {/* Coração sobreposto*/}
        <Heart 
          className="relative w-5 h-5 text-[#1e5bb4] fill-[#1e5bb4]" 
          strokeWidth={0}
        />
      </div>
      
      {/* Texto do logotipo */}
      <span className="text-white font-bold text-xl tracking-wide">Doaí</span>
    </div>
  );
}
