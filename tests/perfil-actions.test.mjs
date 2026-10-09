import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as validacao from "../lib/perfil-validation.ts";

function ambiente(arquivo, falha) {
  const chamadas = [], revalidacoes = [];
  class ErroApi extends Error { constructor(message, status) { super(message); this.status = status; } }
  const request = async (path, opcoes) => { chamadas.push({ path, opcoes }); if (falha) throw falha; return {}; };
  const contexto = { exports: {}, AbortSignal, require(nome) {
    if (nome === "next/cache") return { revalidatePath: (...args) => revalidacoes.push(args) };
    if (nome === "next/navigation") return { unstable_rethrow: (erro) => { if (erro?.redirecionar) throw erro; } };
    if (nome === "@/lib/api") return { ErroApi, fetchApi: request };
    if (nome === "@/lib/auth-server") return { fetchApiAutenticado: request };
    if (nome === "@/lib/perfil-validation") return validacao;
    throw new Error(`Import inesperado: ${nome}`);
  } };
  const fonte = readFileSync(new URL(arquivo, import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, contexto);
  return { executar: async (acao, campos) => {
    const form = new FormData();
    for (const [nome, valor] of Object.entries(campos)) form.set(nome, valor);
    return contexto.exports[acao]({ sucesso: false, mensagem: "" }, form);
  }, chamadas, revalidacoes };
}

const perfil = { nome: "Maria Silva", email: "maria@example.test", telefone: "", cidade: "Vilhena", uf: "RO", bio: "" };
test("ação de perfil usa identidade da sessão, ignora alvo injetado e limita o request", async () => {
  const app = ambiente("../app/(protected)/perfil/editar/actions.ts");
  assert.equal((await app.executar("salvarPerfil", { ...perfil, id: "outro", perfil: "ADMINISTRADOR", cpf: "123" })).sucesso, true);
  assert.equal(app.chamadas[0].path, "perfil");
  assert.equal(app.chamadas[0].opcoes.metodo, "PUT");
  assert.deepEqual(app.chamadas[0].opcoes.body, perfil);
  assert.ok(app.chamadas[0].opcoes.signal instanceof AbortSignal);
  assert.ok(app.revalidacoes.some(([path]) => path === "/perfil"));
});
test("perfil inválido não escreve e sessão expirada preserva redirect do Next", async () => {
  const app = ambiente("../app/(protected)/perfil/editar/actions.ts");
  assert.equal((await app.executar("salvarPerfil", { ...perfil, uf: "ZZ" })).sucesso, false);
  assert.equal(app.chamadas.length, 0);
  const redirect = { redirecionar: true };
  await assert.rejects(ambiente("../app/(protected)/perfil/editar/actions.ts", redirect).executar("salvarPerfil", perfil), (erro) => erro === redirect);
});
test("recuperação retorna resposta genérica sem expor cadastro ou dados internos", async () => {
  const app = ambiente("../app/(auth)/recuperacao-actions.ts");
  const resultado = await app.executar("solicitarRecuperacao", { email: "maria@example.test", redirectTo: "https://evil.test" });
  assert.equal(resultado.sucesso, true);
  assert.match(resultado.mensagem, /Se houver uma conta/);
  assert.equal(app.chamadas[0].path, "auth/esqueci-senha");
  assert.deepEqual(app.chamadas[0].opcoes.body, { email: "maria@example.test" });
  const falhou = await ambiente("../app/(auth)/recuperacao-actions.ts", new Error("private SMTP details")).executar("solicitarRecuperacao", { email: "maria@example.test" });
  assert.doesNotMatch(falhou.mensagem, /private|SMTP/);
});
test("reset exige confirmação antes do request e só envia contrato da fachada", async () => {
  const app = ambiente("../app/(auth)/recuperacao-actions.ts");
  const dados = { token: "qa-token", novaSenha: "NovaSenha123!", confirmarSenha: "OutraSenha123!" };
  assert.equal((await app.executar("redefinirSenha", dados)).sucesso, false);
  assert.equal(app.chamadas.length, 0);
  assert.equal((await app.executar("redefinirSenha", { ...dados, confirmarSenha: dados.novaSenha, userId: "outro" })).sucesso, true);
  assert.equal(app.chamadas[0].path, "auth/redefinir-senha");
  assert.equal(app.chamadas[0].opcoes.metodo, "PUT");
  assert.deepEqual(app.chamadas[0].opcoes.body, { token: "qa-token", novaSenha: "NovaSenha123!" });
});
