"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ErroApi } from "@/lib/api";
import { fetchApiAutenticado } from "@/lib/auth-server";
import { validarPerfil } from "@/lib/perfil-validation";

export type ResultadoPerfil = { sucesso: boolean; mensagem: string };

export async function salvarPerfil(_anterior: ResultadoPerfil, form: FormData): Promise<ResultadoPerfil> {
  const entrada = Object.fromEntries(["nome", "email", "telefone", "cidade", "uf", "bio"].map((campo) => [campo, form.get(campo)]));
  const resultado = validarPerfil(entrada);
  if (resultado.erro !== undefined) return { sucesso: false, mensagem: resultado.erro };
  try {
    // /perfil always derives ownership from the server-held session.
    await fetchApiAutenticado("perfil", { metodo: "PUT", body: resultado.dados, signal: AbortSignal.timeout(10000) });
    revalidatePath("/perfil", "layout");
    revalidatePath("/", "layout");
    return { sucesso: true, mensagem: "Perfil atualizado com sucesso." };
  } catch (erro) {
    unstable_rethrow(erro);
    return { sucesso: false, mensagem: erro instanceof ErroApi && [400, 403, 409, 429].includes(erro.status)
      ? erro.message : "Não foi possível salvar o perfil. Tente novamente." };
  }
}
