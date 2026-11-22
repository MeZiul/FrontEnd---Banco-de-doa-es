export const METRICAS_ADMIN = [
  { id: "usuarios", titulo: "Usuários cadastrados", descricao: "Todas as situações de cadastro" },
  { id: "ativos", titulo: "Usuários ativos", descricao: "Cadastros na situação ativo" },
  { id: "itens", titulo: "Itens cadastrados", descricao: "Todas as etapas da doação" },
  { id: "disponiveis", titulo: "Itens disponíveis", descricao: "Itens disponíveis para interesse" },
  { id: "doados", titulo: "Doações concluídas", descricao: "Itens na etapa doado" },
  { id: "denuncias", titulo: "Denúncias em análise", descricao: "Relatos aguardando uma decisão" },
] as const;

// Partes na ordem natural do fluxo (a mesma dos enums do back), não por tamanho.
// `tipo` escolhe o formato: colunas e barras comparam as partes; rosca e segmentado mostram a fatia de cada uma no total.
export const GRAFICOS_ADMIN = [
  {
    id: "itens_por_status",
    tipo: "colunas",
    titulo: "Itens por etapa",
    descricao: "Em que ponto da doação estão os itens cadastrados",
    partes: [
      ["DISPONIVEL", "Disponíveis"],
      ["RESERVADO", "Reservados"],
      ["AGUARDANDO_CONFIRMACAO", "Aguardando confirmação"],
      ["DOADO", "Doados"],
      ["CANCELADO", "Cancelados"],
    ],
  },
  {
    id: "interesses_por_status",
    tipo: "barras",
    titulo: "Interesses por situação",
    descricao: "Pedidos de quem quer receber uma doação",
    partes: [
      ["PENDENTE", "Pendentes"],
      ["ACEITO", "Aceitos"],
      ["RECUSADO", "Recusados"],
      ["CANCELADO", "Cancelados"],
      ["EXPIRADO", "Expirados"],
    ],
  },
  {
    id: "usuarios_por_situacao",
    tipo: "rosca",
    titulo: "Usuários por situação",
    descricao: "Contas ativas, suspensas e inativas",
    partes: [
      ["ATIVO", "Ativos"],
      ["SUSPENSO", "Suspensos"],
      ["INATIVO", "Inativos"],
    ],
  },
  {
    id: "denuncias_por_status",
    tipo: "segmentado",
    titulo: "Denúncias por resultado",
    descricao: "Relatos em análise e já decididos",
    partes: [
      ["EM_ANALISE", "Em análise"],
      ["PROCEDENTE", "Procedentes"],
      ["IMPROCEDENTE", "Improcedentes"],
    ],
  },
] as const;

export type MetricaAdmin = {
  id: (typeof METRICAS_ADMIN)[number]["id"];
  titulo: string;
  descricao: string;
  total: number | null;
};

export type GraficoAdmin = {
  id: (typeof GRAFICOS_ADMIN)[number]["id"];
  tipo: (typeof GRAFICOS_ADMIN)[number]["tipo"];
  titulo: string;
  descricao: string;
  // null quando alguma parte veio inválida: o gráfico inteiro fica indisponível para não mostrar proporções erradas.
  partes: { chave: string; rotulo: string; total: number }[] | null;
};

export type MesAdmin = { mes: string; rotulo: string; usuarios: number; itens: number };

export type DashboardAdmin = {
  metricas: MetricaAdmin[];
  graficos: GraficoAdmin[];
  // null quando a série veio ausente ou inválida.
  serie: MesAdmin[] | null;
};

export function administradorAtivo(usuario: { perfil?: string; situacao?: string } | null | undefined) {
  return usuario?.perfil === "ADMINISTRADOR" && usuario.situacao === "ATIVO";
}

function comoObjeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as Record<string, unknown>) : {};
}

function contador(valor: unknown) {
  return typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0 ? valor : null;
}

// Valida o snapshot de GET /admin/metricas e cada evento do stream, que têm o mesmo formato.
// Um contador inválido vira null ("Indisponível") sem esconder os outros; campos extras não passam.
export function montarMetricasAdmin(dados: unknown): MetricaAdmin[] {
  const valores = comoObjeto(dados);
  return METRICAS_ADMIN.map(({ id, titulo, descricao }) => ({ id, titulo, descricao, total: contador(valores[id]) }));
}

export function montarGraficosAdmin(dados: unknown): GraficoAdmin[] {
  const valores = comoObjeto(dados);
  return GRAFICOS_ADMIN.map(({ id, tipo, titulo, descricao, partes }) => {
    const contagem = comoObjeto(valores[id]);
    const lidas = partes.map(([chave, rotulo]) => ({ chave, rotulo, total: contador(contagem[chave]) }));
    return {
      id,
      tipo,
      titulo,
      descricao,
      partes: lidas.every((parte) => parte.total !== null) ? (lidas as { chave: string; rotulo: string; total: number }[]) : null,
    };
  });
}

const MES_VALIDO = /^(\d{4})-(0[1-9]|1[0-2])$/;
const nomeDoMes = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });

// "2026-06" vira "jun"; o ano entra só em janeiro, quando ele muda dentro da série.
function rotuloDoMes(ano: number, mes: number) {
  const nome = nomeDoMes.format(new Date(Date.UTC(ano, mes - 1, 1))).replace(".", "");
  return mes === 1 ? `${nome}/${String(ano).slice(2)}` : nome;
}

export function montarSerieMensal(dados: unknown): MesAdmin[] | null {
  const linhas = comoObjeto(dados).novos_por_mes;
  if (!Array.isArray(linhas) || linhas.length === 0 || linhas.length > 24) return null;
  const meses: MesAdmin[] = [];
  for (const linha of linhas) {
    const { mes, usuarios, itens } = comoObjeto(linha);
    const partes = typeof mes === "string" ? MES_VALIDO.exec(mes) : null;
    const totalUsuarios = contador(usuarios);
    const totalItens = contador(itens);
    if (!partes || totalUsuarios === null || totalItens === null) return null;
    meses.push({ mes: partes[0], rotulo: rotuloDoMes(Number(partes[1]), Number(partes[2])), usuarios: totalUsuarios, itens: totalItens });
  }
  return meses;
}

export function montarDashboardAdmin(dados: unknown): DashboardAdmin {
  return { metricas: montarMetricasAdmin(dados), graficos: montarGraficosAdmin(dados), serie: montarSerieMensal(dados) };
}
