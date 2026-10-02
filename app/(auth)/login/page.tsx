"use client";


import EsquerdaAutenticacao from "@/components/auth/esqueda-autenticacao";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">

      <EsquerdaAutenticacao />

      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] p-6 md:p-10">
        {children}
      </div>

    </div>
  );
}
