import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Executa a action real com a API isolada, sem credenciais nem banco.
const fonte = readFileSync(new URL("../app/(protected)/admin/usuarios/actions.ts", import.meta.url), "utf8");
const compilado = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function ambiente({ falha = null } = {}) {
  const chamadas = [];
  const contexto = {
    exports: {},
    Error, // mesmo Error deste arquivo, para o instanceof da action funcionar no vm
    require(nome) {
      if (nome === "next/navigation") return { unstable_rethrow: () => {} };
      if (nome === "@/lib/admin-filtros") return { FILTROS_USUARIOS: [], filtrosValidos: () => ({}) };
      if (nome === "@/lib/auth-server") return {
        fetchApiAutenticado: async (path, opcoes) => {
          chamadas.push({ path, opcoes });
          if (falha) throw new Error(falha);
          return {};
        },
      };
      throw new Error(`Import inesperado: ${nome}`);
    },
  };
  vm.runInNewContext(compilado, contexto);
  return { acao: contexto.exports.alterarPerfilUsuario, chamadas };
}

test("promove e rebaixa com PATCH na rota de perfil", async () => {
  const app = ambiente();
  assert.deepEqual({ ...(await app.acao("u/1", "ADMINISTRADOR")) }, { ok: true });
  await app.acao("u2", "USUARIO");
  assert.equal(app.chamadas[0].path, "admin/usuarios/u%2F1/perfil");
  assert.equal(app.chamadas[0].opcoes.metodo, "PATCH");
  assert.deepEqual({ ...app.chamadas[0].opcoes.body }, { perfil: "ADMINISTRADOR" });
  assert.deepEqual({ ...app.chamadas[1].opcoes.body }, { perfil: "USUARIO" });
});

test("perfil ou id inválido não chegam à API", async () => {
  const app = ambiente();
  assert.equal((await app.acao("u1", "SUPERADMIN")).ok, false);
  assert.equal((await app.acao("", "USUARIO")).ok, false);
  assert.equal(app.chamadas.length, 0);
});

test("erro da API vira mensagem para o card", async () => {
  const app = ambiente({ falha: "Não é permitido alterar o próprio perfil de acesso por esta rota." });
  assert.deepEqual({ ...(await app.acao("u1", "USUARIO")) }, { ok: false, erro: "Não é permitido alterar o próprio perfil de acesso por esta rota." });
});