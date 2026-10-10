import EsquerdaAutenticacao from "@/components/auth/esqueda-autenticacao";
import { RecuperacaoForm } from "@/components/auth/recuperacao-form";

export default function EsqueciSenhaPage() {
  return <div className="grid min-h-svh lg:grid-cols-2"><EsquerdaAutenticacao /><div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] p-6 md:p-10"><div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm"><RecuperacaoForm /></div></div></div>;
}
