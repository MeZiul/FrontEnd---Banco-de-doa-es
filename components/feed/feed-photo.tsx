"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

export function FeedPhoto({ src, titulo }: { src?: string; titulo: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      {src && failedSrc !== src ? (
        <Image src={src} alt={titulo} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
          <ImageOff className="size-8" aria-hidden="true" /><span className="text-sm">Foto indisponível</span>
        </div>
      )}
    </div>
  );
}
