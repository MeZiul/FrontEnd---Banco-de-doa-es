import EsquerdaAutenticacao from "@/components/auth/esqueda-autenticacao";
import { LoginForm } from "@/components/auth/login-form";
import { exigirVisitante } from "@/lib/auth-guest";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  await exigirVisitante();
  const params = await searchParams;
  return (
    <div data-test="paginaLogin" className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">

      <EsquerdaAutenticacao />

      <main className="flex min-h-svh items-center justify-center bg-blue-50/40 p-5 dark:bg-background md:p-10">
        <div data-test="cardLogin" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm md:p-9">
          <LoginForm destino={typeof params.redirect === "string" ? params.redirect : undefined} cadastroConcluido={params.cadastro === "sucesso"} />
        </div>
      </main>

    </div>
  );
}
