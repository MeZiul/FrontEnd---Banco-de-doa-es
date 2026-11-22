import { API_URL } from "@/lib/api";
import { getToken, validarSessaoNativa } from "@/lib/auth-server";
import { repassarStreamMetricas } from "@/lib/admin-stream";

export async function GET(request: Request) {
  return repassarStreamMetricas({
    token: await getToken(),
    sessaoValida: validarSessaoNativa,
    apiUrl: API_URL,
    sinal: request.signal,
  });
}
