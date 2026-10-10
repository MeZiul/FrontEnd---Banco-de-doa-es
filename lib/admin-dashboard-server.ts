import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { administradorAtivo, consultarMetricasAdmin } from "@/lib/admin-metrics";
import type { Usuario } from "@/types/usuario";

export async function exigirAdministradorAtivo() {
  try {
    const usuario = await fetchApiAutenticado<Pick<Usuario, "perfil" | "situacao">>("perfil", {
      signal: AbortSignal.timeout(10_000),
    });
    if (!administradorAtivo(usuario)) redirect("/");
  } catch (erro) {
    tratarErroDeAcesso(erro);
    throw erro;
  }
}
function tratarErroDeAcesso(erro: unknown) {
  unstable_rethrow(erro);
  if (erro instanceof ErroApi && (erro.status === 401 || erro.status === 498)) redirect("/login");
  if (erro instanceof ErroApi && erro.status === 403) redirect("/");
}
export async function obterDashboardAdmin() {
  // Uma guarda na página/DAL evita depender apenas da reutilização do layout.
  await exigirAdministradorAtivo();
  return consultarMetricasAdmin(
    (caminho, params) => fetchApiAutenticado(caminho, { params, signal: AbortSignal.timeout(10_000) }),
    tratarErroDeAcesso,
  );
}
