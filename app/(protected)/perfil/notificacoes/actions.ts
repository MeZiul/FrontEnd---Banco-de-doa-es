"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { ErroApi } from "@/lib/api";

export type EstadoNotificacao = { erro?: string; sucesso?: string };
export async function marcarLidas(_estado: EstadoNotificacao, form: FormData): Promise<EstadoNotificacao> {
  const id = form.get("id");
  const todas = form.get("todas") === "true";
  if (!todas && (typeof id !== "string" || !/^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i.test(id))) return { erro: "Notificação inválida." };
  try {
    await fetchApiAutenticado(todas ? "notificacoes/ler-tudo" : `notificacoes/${id}/ler`, { metodo: todas ? "POST" : "PATCH", signal: AbortSignal.timeout(10000) });
  } catch (erro) {
    unstable_rethrow(erro);
    return { erro: erro instanceof ErroApi && [400, 403, 404, 409, 429].includes(erro.status) ? erro.message : "Não foi possível marcar as notificações. Tente novamente." };
  }
  revalidatePath("/", "layout");
  return { sucesso: todas ? "Notificações marcadas como lidas." : "Notificação marcada como lida." };
}
