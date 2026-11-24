import type { CampoFiltro, OpcaoFiltro } from "@/components/shared/barra-filtros";
import { STATUS_ITEM } from "@/lib/status-item";

const opcoes = (rotulos: Record<string, string>): OpcaoFiltro[] =>
  Object.entries(rotulos).map(([valor, nome]) => ({ valor, nome }));

// Campos de cada lista do admin. Os nomes são os parâmetros que a API aceita.
export const FILTROS_USUARIOS: readonly CampoFiltro[] = [
  { tipo: "texto", nome: "nome", rotulo: "Nome", placeholder: "Parte do nome" },
  { tipo: "texto", nome: "email", rotulo: "E-mail", placeholder: "Parte do e-mail", maxLength: 254 },
  { tipo: "select", nome: "situacao", rotulo: "Situação", todos: "Todas", opcoes: opcoes({ ATIVO: "Ativo", SUSPENSO: "Suspenso", INATIVO: "Inativo" }) },
  { tipo: "select", nome: "perfil", rotulo: "Perfil", opcoes: opcoes({ USUARIO: "Usuário", ADMINISTRADOR: "Administrador" }) },
];

export const FILTROS_DENUNCIAS: readonly CampoFiltro[] = [
  { tipo: "select", nome: "status", rotulo: "Status", opcoes: opcoes({ EM_ANALISE: "Em análise", PROCEDENTE: "Procedente", IMPROCEDENTE: "Improcedente" }) },
  { tipo: "select", nome: "tipo_alvo", rotulo: "Alvo", opcoes: opcoes({ ITEM: "Anúncio", USUARIO: "Usuário" }) },
  {
    tipo: "select", nome: "motivo", rotulo: "Motivo", opcoes: opcoes({
      CONTEUDO_INAPROPRIADO: "Conteúdo inapropriado", ITEM_PROIBIDO: "Item proibido", FRAUDE: "Fraude", ASSEDIO: "Assédio", SPAM: "Spam", OUTRO: "Outro",
    }),
  },
];

export const FILTROS_AUDITORIA: readonly CampoFiltro[] = [
  {
    tipo: "select", nome: "tipo_acao", rotulo: "Ação", todos: "Todas", opcoes: opcoes({
      BLOQUEIO_USUARIO: "Bloqueio de usuário", DESBLOQUEIO_USUARIO: "Desbloqueio de usuário", INATIVACAO_USUARIO: "Inativação de usuário",
      CANCELAMENTO_ITEM: "Cancelamento de anúncio", RESOLUCAO_DENUNCIA: "Resolução de denúncia",
    }),
  },
  { tipo: "select", nome: "tipo_alvo", rotulo: "Alvo", opcoes: opcoes({ USUARIO: "Usuário", ITEM: "Anúncio", DENUNCIA: "Denúncia" }) },
];

export const FILTROS_ITENS: readonly CampoFiltro[] = [
  { tipo: "texto", nome: "busca", rotulo: "Buscar", placeholder: "Título ou descrição" },
  { tipo: "select", nome: "status", rotulo: "Situação", todos: "Todas", opcoes: Object.entries(STATUS_ITEM).map(([valor, { nome }]) => ({ valor, nome })) },
];

/** Mantém só filtros conhecidos e válidos: opção existente no select, texto aparado e cortado. */
export function filtrosValidos(campos: readonly CampoFiltro[], valores: Record<string, unknown>): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const campo of campos) {
    const valor = typeof valores[campo.nome] === "string" ? (valores[campo.nome] as string).trim() : "";
    if (!valor) continue;
    if (campo.tipo === "select" && !campo.opcoes.some((opcao) => opcao.valor === valor)) continue;
    if (campo.tipo === "data" && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) continue;
    resultado[campo.nome] = campo.tipo === "texto" ? valor.slice(0, campo.maxLength ?? 100) : valor;
  }
  return resultado;
}