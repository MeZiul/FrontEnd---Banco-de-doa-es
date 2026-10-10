type Parametros = Record<string, string | number>;
// Ausência de status na API seleciona DISPONIVEL. O total precisa cobrir
// cada estado disjunto suportado pelo schema vigente de ItemDoacao.
const STATUS_ITENS = ["DISPONIVEL", "RESERVADO", "AGUARDANDO_CONFIRMACAO", "DOADO", "CANCELADO"] as const;
export const METRICAS_ADMIN = [
  { id: "usuarios", titulo: "Usuários cadastrados", descricao: "Todas as situações de cadastro", caminho: "admin/usuarios", filtros: {} },
  { id: "ativos", titulo: "Usuários ativos", descricao: "Cadastros na situação ativo", caminho: "admin/usuarios", filtros: { situacao: "ATIVO" } },
  { id: "itens", titulo: "Itens cadastrados", descricao: "Todas as etapas da doação", caminho: "admin/itens", filtros: {}, somarStatus: STATUS_ITENS },
  { id: "disponiveis", titulo: "Itens disponíveis", descricao: "Itens disponíveis para interesse", caminho: "admin/itens", filtros: { status: "DISPONIVEL" } },
  { id: "doados", titulo: "Doações concluídas", descricao: "Itens na etapa doado", caminho: "admin/itens", filtros: { status: "DOADO" } },
  { id: "denuncias", titulo: "Denúncias em análise", descricao: "Relatos aguardando uma decisão", caminho: "admin/denuncias", filtros: { status: "EM_ANALISE" } },
] as const;

export function administradorAtivo(usuario: { perfil?: string; situacao?: string } | null | undefined) {
  return usuario?.perfil === "ADMINISTRADOR" && usuario.situacao === "ATIVO";
}
type Consulta = (caminho: string, params: Parametros) => Promise<unknown>;

// Mantém somente a contagem no DTO da tela; docs e dados pessoais ficam no servidor.
export async function consultarMetricasAdmin(consultar: Consulta, erroDeAcesso: (erro: unknown) => void) {
  return Promise.all(METRICAS_ADMIN.map(async (metrica) => {
    try {
      const filtros = "somarStatus" in metrica
        ? metrica.somarStatus.map((status) => ({ status }))
        : [metrica.filtros];
      const consultas = await Promise.allSettled(filtros.map(async (filtro) => {
        const resposta = await consultar(metrica.caminho, { ...filtro, page: 1, limit: 1 });
        const total = (resposta as { totalDocs?: unknown } | null)?.totalDocs;
        if (typeof total !== "number" || !Number.isSafeInteger(total) || total < 0) {
          throw new Error("Contagem inválida na resposta administrativa.");
        }
        return total;
      }));
      let total = 0;
      let falhou = false;
      // Uma falha de transporte rápida não pode ocultar perda de acesso em
      // outra parcela. Todas terminam antes de decidir pelo estado parcial.
      for (const consulta of consultas) {
        if (consulta.status === "rejected") {
          erroDeAcesso(consulta.reason);
          falhou = true;
        } else {
          total += consulta.value;
        }
      }
      if (falhou) throw new Error("Consulta administrativa incompleta.");
      if (!Number.isSafeInteger(total)) {
        throw new Error("Contagem inválida na resposta administrativa.");
      }
      return { id: metrica.id, titulo: metrica.titulo, descricao: metrica.descricao, total };
    } catch (erro) {
      // Redirecionamentos e perda de permissão devem interromper toda a resposta.
      erroDeAcesso(erro);
      return { id: metrica.id, titulo: metrica.titulo, descricao: metrica.descricao, total: null };
    }
  }));
}
