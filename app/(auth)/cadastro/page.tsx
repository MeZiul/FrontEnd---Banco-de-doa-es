import EsquerdaAutenticacao from "@/components/auth/esqueda-autenticacao";
import { SignupForm } from "@/components/auth/signup-form";
import { exigirVisitante } from "@/lib/auth-guest";

export default async function CadastroPage() {
  await exigirVisitante();
  return (
    <div data-test="paginaCadastro" className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">

      <EsquerdaAutenticacao />

      <main className="flex min-h-svh items-center justify-center bg-blue-50/40 p-5 dark:bg-background md:p-10">
        <div data-test="cardCadastro" className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-sm md:p-9">
          <SignupForm />
        </div>
      </main>

    </div>
  );
}
