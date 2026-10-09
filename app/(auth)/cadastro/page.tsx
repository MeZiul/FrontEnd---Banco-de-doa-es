import EsquerdaAutenticacao from "@/components/auth/esqueda-autenticacao";
import { SignupForm } from "@/components/auth/signup-form";

export default function CadastroPage() {
  return (
    <div data-test="paginaCadastro" className="grid min-h-svh lg:grid-cols-2">

      <EsquerdaAutenticacao />

      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] p-6 md:p-10">
        <div data-test="cardCadastro" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>

    </div>
  );
}
