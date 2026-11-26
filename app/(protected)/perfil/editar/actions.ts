"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { ErroApi, fetchApi } from "@/lib/api";
import { COOKIE_TOKEN } from "@/lib/auth-cookie";
import { fetchApiAutenticado, getToken, validarSessaoNativa } from "@/lib/auth-server";
import { lerPerfil } from "@/lib/perfil-validation";

export type ResultadoPerfil = {
  sucesso: boolean;
  mensagem: string;
};

export async function salvarPerfil(
  _anterior: ResultadoPerfil,
  form: FormData
): Promise<ResultadoPerfil> {
  const entrada = Object.fromEntries(
    ["nome", "email", "telefone", "cidade", "uf", "bio"].map((campo) => [campo, form.get(campo)])
  );

  try {
    await fetchApiAutenticado("perfil", {
      metodo: "PUT",
      body: lerPerfil(entrada),
      signal: AbortSignal.timeout(10000)
    });

    revalidatePath("/perfil", "layout");
    revalidatePath("/", "layout");

    return {
      sucesso: true,
      mensagem: "Perfil atualizado com sucesso."
    };
  } catch (erro) {
    unstable_rethrow(erro);

    return {
      sucesso: false,
      mensagem:
        erro instanceof ErroApi &&
          [400, 403, 409, 429].includes(erro.status)
          ? erro.message
          : "Não foi possível salvar o perfil. Tente novamente."
    };
  }
}

export async function desativarConta(): Promise<ResultadoPerfil> {
  try {
    // Exige uma sessão real, sem utilizar o login automático de desenvolvimento
    const token = await getToken({ permitirLoginDev: false });

    if (!token || !(await validarSessaoNativa(token))) {
      redirect("/login");
    }

    // Desativa exclusivamente a conta autenticada
    await fetchApi<void>("perfil", {
      metodo: "DELETE",
      token,
      signal: AbortSignal.timeout(10000)
    });
  } catch (erro) {
    unstable_rethrow(erro);

    if (erro instanceof ErroApi && [401, 498].includes(erro.status)) {
      redirect("/login");
    }

    return {
      sucesso: false,
      mensagem:
        erro instanceof ErroApi &&
          [400, 403, 404, 409, 429].includes(erro.status)
          ? erro.message
          : "Não foi possível desativar a conta. Tente novamente."
    };
  }

  const cookieStore = await cookies();

  // Remove o cookie do login tradicional
  cookieStore.delete(COOKIE_TOKEN);

  // Remove os cookies utilizados pela autenticação OAuth
  for (const { name } of cookieStore.getAll()) {
    if (name.startsWith("better-auth.") || name.startsWith("__Secure-better-auth.")) {
      cookieStore.delete(name);
    }
  }

  revalidatePath("/", "layout");

  redirect("/login");
}