type OpcoesRepasse = {
  token: string | undefined;
  sessaoValida: (token: string) => Promise<boolean>;
  apiUrl: string | undefined;
  sinal: AbortSignal;
  buscar?: typeof fetch;
};

function erro(status: number, mensagem: string) {
  return Response.json({ mensagem }, { status });
}

/**
 * Repassa o stream SSE de métricas do back para o navegador.
 * O token fica no cookie HttpOnly, então o EventSource não consegue chamar a API direto.
 * O back confere o papel de administrador na abertura e a cada envio.
 */
export async function repassarStreamMetricas({ token, sessaoValida, apiUrl, sinal, buscar = fetch }: OpcoesRepasse) {
  if (!token) return erro(401, "Entre novamente para acompanhar o painel.");
  if (!apiUrl) {
    console.error("API_INTERNAL_URL/NEXT_PUBLIC_API_URL não definida para o stream de métricas.");
    return erro(502, "Painel ao vivo indisponível.");
  }

  let resposta: Response;
  try {
    if (!(await sessaoValida(token))) return erro(401, "Entre novamente para acompanhar o painel.");
    resposta = await buscar(new URL("admin/metricas/stream", `${apiUrl.replace(/\/$/, "")}/`), {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
      cache: "no-store",
      // Fechar a aba cancela a conexão com o back, que libera a vaga do limite de conexões.
      signal: sinal,
    });
  } catch (falha) {
    if (!sinal.aborted) console.error("Falha ao conectar ao stream de métricas.", falha);
    return erro(502, "Painel ao vivo indisponível.");
  }

  if (resposta.ok && resposta.body) {
    return new Response(resposta.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        // no-transform impede a compressão do `next start` de segurar os eventos em buffer.
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  await resposta.body?.cancel();
  if (resposta.status === 401 || resposta.status === 498) return erro(401, "Entre novamente para acompanhar o painel.");
  if (resposta.status === 403) return erro(403, "Acesso restrito a administradores ativos.");
  if (resposta.status === 429) return erro(429, "Há muitos painéis abertos para esta conta. Feche outras abas e tente novamente.");
  console.error(`O stream de métricas respondeu com status ${resposta.status}.`);
  return erro(502, "Painel ao vivo indisponível.");
}