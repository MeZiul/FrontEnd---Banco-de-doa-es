import { revalidatePath } from "next/cache";
import { ErroApi, fetchApi } from "@/lib/api";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";
import {
  ErroDoacao,
  ID_DOACAO,
  MAX_FOTO,
  validarFotos,
} from "@/lib/doacao-validation";

// Cookie-based mutations require a browser request from this exact origin.
// Next can normalize request.url to localhost; Host preserves the browser origin.
function ehMesmaOrigem(request: Request): boolean {
  const origem = request.headers.get("origin");
  if (!origem || !URL.canParse(origem)) return false;
  const url = new URL(origem);
  const protocolo =
    request.headers.get("x-forwarded-proto") === "https"
      ? "https:"
      : new URL(request.url).protocol;
  return url.host === request.headers.get("host") && url.protocol === protocolo;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!ehMesmaOrigem(request)) {
    return Response.json(
      { mensagem: "Origem da solicitação inválida." },
      { status: 403 },
    );
  }
  const { id } = await params;
  if (!ID_DOACAO.test(id))
    return Response.json({ mensagem: "Doação inválida." }, { status: 400 });
  const token = await getToken();
  if (!token)
    return Response.json(
      { mensagem: "Entre novamente para enviar fotos." },
      { status: 401 },
    );
  // Read a bounded body before parsing multipart, including for chunked requests.
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ mensagem: "Envie uma foto." }, { status: 400 });
  try {
    if (!(await validarSessaoNativa(token))) {
      return Response.json(
        { mensagem: "Entre novamente para enviar fotos." },
        { status: 401 },
      );
    }
    const usuario = await fetchApi<{ situacao: string }>("perfil", {
      token,
      signal: AbortSignal.timeout(10000),
    });
    if (usuario.situacao !== "ATIVO")
      return Response.json(
        { mensagem: "Sua conta precisa estar ativa." },
        { status: 403 },
      );
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FOTO + 65536) {
        await reader.cancel();
        return Response.json(
          { mensagem: "A foto excede o limite de 4 MB." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const dados = await new Response(bytes, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
    const entradas = [...dados.entries()];
    if (
      entradas.length !== 1 ||
      entradas[0][0] !== "fotos" ||
      !(entradas[0][1] instanceof File)
    ) {
      throw new ErroDoacao("Envie uma foto por vez.");
    }
    validarFotos([entradas[0][1]], 1);
    const api = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!api) throw new Error("API indisponível");
    const resposta = await fetch(
      new URL(`itemdoacao/${id}/fotos`, `${api.replace(/\/$/, "")}/`),
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dados,
        signal: AbortSignal.timeout(30000),
      },
    );
    const json = await resposta.json();
    if (!resposta.ok)
      return Response.json(
        {
          mensagem:
            json.erro || json.message || "Não foi possível enviar a foto.",
        },
        { status: resposta.status },
      );
    revalidatePath("/");
    revalidatePath(`/doacoes/${id}`);
    revalidatePath("/perfil/meus-anuncios");
    return Response.json({ mensagem: "Foto adicionada.", sucesso: true });
  } catch (erro) {
    if (erro instanceof ErroApi || erro instanceof ErroDoacao) {
      return Response.json(
        { mensagem: erro.message },
        { status: erro instanceof ErroApi ? erro.status : 400 },
      );
    }
    // Falha inesperada (API fora do ar, timeout, resposta inválida): a pessoa vê
    // uma mensagem genérica e a causa fica registrada no log do servidor.
    console.error(`Falha ao enviar foto da doação ${id}:`, erro);
    return Response.json(
      {
        mensagem:
          "Não foi possível enviar a foto. Confira as fotos do anúncio antes de tentar novamente.",
      },
      { status: 502 },
    );
  } finally {
    reader.releaseLock();
  }
}
