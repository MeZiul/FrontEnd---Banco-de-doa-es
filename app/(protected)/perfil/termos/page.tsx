// (Ana Júlia) Texto estático.
import Link from "next/link";

export default function TermosPage() {
  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Termos de uso</h1>
      <p>O texto dos termos de uso e da política de privacidade ainda não está disponível nesta página.</p>
      <Link href="/perfil/meus-anuncios" className="text-blue-700 underline">Voltar aos meus anúncios</Link>
    </section>
  );
}
