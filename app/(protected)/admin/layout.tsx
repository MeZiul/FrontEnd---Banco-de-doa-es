import { redirect } from "next/navigation";
import { getUsuarioLogado } from "@/lib/auth-server";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const usuario = await getUsuarioLogado();

  if (usuario.perfil !== "ADMINISTRADOR") redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
