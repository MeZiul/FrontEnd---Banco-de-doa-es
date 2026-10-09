"use client";
export default function ErroPerfil({ retry }: { retry: () => void }) {
  return <div className="rounded-2xl border bg-white p-6"><p role="alert">Não foi possível carregar seu perfil.</p><button onClick={retry} className="mt-3 rounded-lg bg-[#2973ba] px-4 py-2 text-white">Tentar novamente</button></div>;
}
