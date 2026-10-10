import { TermosConteudo } from "@/components/shared/termos-conteudo";
import Link from "next/link";
export default function TermosPage() {
  return <div className="w-full space-y-6"><h1 className="text-2xl font-bold text-slate-900">Termos de Uso</h1><TermosConteudo /><Link href="/privacidade" className="text-blue-700 underline">Política de privacidade</Link></div>;
}
