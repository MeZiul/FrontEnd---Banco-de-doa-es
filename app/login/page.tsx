"use client";

import EsquedaAutenticacao from "@/components/esqueda-autenticacao";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">

      <EsquedaAutenticacao pagina="login" />

      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] p-6 md:p-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>

    </div>
  );
}