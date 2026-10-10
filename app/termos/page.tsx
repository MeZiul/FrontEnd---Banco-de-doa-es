import Link from "next/link";
import { TermosConteudo } from "@/components/shared/termos-conteudo";
export const metadata = { title: "Termos de Uso | Doaí" };
export default function TermosPublicos() {
  return <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8"><Link href="/" className="font-bold text-blue-700">Doaí</Link><h1 className="text-2xl font-bold text-slate-900">Termos de Uso</h1><TermosConteudo /><nav aria-label="Documentos do Doaí" className="flex flex-wrap gap-5 text-blue-700 underline"><Link href="/privacidade">Política de privacidade</Link><Link href="/cadastro">Voltar ao cadastro</Link></nav></main>;
}
