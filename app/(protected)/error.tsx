"use client";
export default function ErroConta({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section role="alert" className="mx-auto my-8 max-w-xl rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">Não foi possível carregar sua conta</h1><p className="mt-2">Tente novamente em instantes.</p><button onClick={retry} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-white">Tentar novamente</button></section>;
}
