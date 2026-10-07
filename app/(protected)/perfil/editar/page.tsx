// (Ana Júlia visual / Luiz integra salvamento)
import Link from "next/link";

export default function EditarPerfilPage() {
  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Editar perfil</h1>
      <p>A edição do perfil ainda está em desenvolvimento.</p>
      <Link href="/perfil/meus-anuncios" className="text-blue-700 underline">Voltar aos meus anúncios</Link>
    </section>
  );
}
