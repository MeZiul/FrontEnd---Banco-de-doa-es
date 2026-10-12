import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const Link = function Link() {};
const usuarioId = '65a100000000000000000001';

function paginado(page = 2, overrides = {}) {
  return {
    docs: [{
      _id: '65a200000000000000000001',
      item_id: {
        _id: '65a300000000000000000001',
        titulo: 'Doação de teste',
        status: 'DISPONIVEL',
        cidade: 'Cuiabá',
        uf: 'MT',
        total_interesses: 1,
      },
      usuario_interessado_id: { _id: usuarioId, nome: 'Pessoa solicitante', email: 'pessoa@example.test', cidade: 'Cuiabá', uf: 'MT' },
      usuario_doador_id: { _id: '65a400000000000000000001', nome: 'Pessoa doadora', email: 'doador@example.test', cidade: 'Cuiabá', uf: 'MT' },
      mensagem_interessado: null,
      resposta_doador: null,
      status: 'PENDENTE',
      data_interesse: '2026-10-10T12:00:00.000Z',
      data_resposta: null,
      data_cancelamento: null,
    }],
    totalDocs: 41,
    limit: 20,
    totalPages: 3,
    page,
    hasPrevPage: page > 1,
    hasNextPage: page < 3,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < 3 ? page + 1 : null,
    ...overrides,
  };
}

function carregar({ usuario = { _id: usuarioId, perfil: 'USUARIO', situacao: 'ATIVO' }, resposta = paginado(), erro = null } = {}) {
  const chamadas = [];
  const timeouts = [];
  const JSX = {
    jsx: (type, props, key) => ({ type, props: props ?? {}, key }),
    jsxs: (type, props, key) => ({ type, props: props ?? {}, key }),
  };
  const icons = Object.fromEntries(['Clock', 'CheckCircle2', 'XCircle', 'Ban', 'User', 'Calendar', 'MapPin', 'Package'].map((name) => [name, function Icon() {}]));
  const contexto = {
    exports: {},
    AbortSignal: { timeout: (milliseconds) => { timeouts.push(milliseconds); return { milliseconds }; } },
    require(nome) {
      if (nome === 'react/jsx-runtime') return JSX;
      if (nome === 'next/link') return { default: Link };
      if (nome === 'next/navigation') return {
        unstable_rethrow(throwable) { if (throwable?.redirectTo) throw throwable; },
        redirect(path) { throw { redirectTo: path }; },
      };
      if (nome === 'lucide-react') return icons;
      if (nome === '@/lib/auth-server') return {
        getUsuarioLogado: async () => usuario,
        fetchApiAutenticado: async (path, options) => {
          chamadas.push({ path, options });
          if (erro) throw erro;
          return resposta;
        },
      };
      if (nome === '@/components/perfil/confirmar-recebimento-form') return { ConfirmarRecebimentoForm: function ConfirmarRecebimentoForm() {} };
      if (nome === '@/components/feed/feed-retry') return { FeedRetry: function FeedRetry() {} };
      throw new Error('Import inesperado: ' + nome);
    },
  };
  const path = new URL('../app/(protected)/perfil/minhas-solicitacoes/page.tsx', import.meta.url);
  const source = readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(output, contexto);
  return {
    chamadas,
    timeouts,
    render: (page) => contexto.exports.default({ searchParams: Promise.resolve(page === undefined ? {} : { page }) }),
  };
}

function links(node) {
  const found = [];
  function visit(value) {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (value.type === Link) found.push(value.props);
    visit(value.props?.children);
  }
  visit(node);
  return found;
}

function texto(node) {
  if (Array.isArray(node)) return node.map(texto).join(' ');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || typeof node !== 'object') return '';
  return texto(node.props?.children);
}

test('usa o parâmetro oficial de escopo e paginação para usuário comum e administrador', async () => {
  for (const perfil of ['USUARIO', 'ADMINISTRADOR']) {
    const app = carregar({ usuario: { _id: usuarioId, perfil, situacao: 'ATIVO' } });
    const tree = await app.render('2');

    assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas[0].options.params)), {
      usuario_interessado_id: usuarioId,
      page: 2,
      limit: 20,
    });
    assert.equal(app.chamadas[0].path, 'interesses');
    assert.equal(app.timeouts[0], 10000);
    assert.match(texto(tree).replace(/\s+/g, ' '), /Página 2 de 3/);
    assert.deepEqual(links(tree).map((link) => link.href).filter((href) => href.startsWith('?page=')), ['?page=1', '?page=3']);
  }
});

test('normaliza páginas malformadas ou fora da faixa segura para página 1', async () => {
  for (const input of ['0', '-1', '1.5', '1e2', '9007199254740992', 'texto']) {
    const app = carregar({ resposta: paginado(1, { totalPages: 1, hasPrevPage: false, hasNextPage: false }) });
    await app.render(input);
    assert.deepEqual(JSON.parse(JSON.stringify(app.chamadas[0].options.params)), {
      usuario_interessado_id: usuarioId,
      page: 1,
      limit: 20,
    });
  }
});

test('redireciona página além da última página disponível', async () => {
  const app = carregar({ resposta: paginado(10) });
  await assert.rejects(() => app.render('10'), (erro) => erro.redirectTo === '/perfil/minhas-solicitacoes?page=3');
});

