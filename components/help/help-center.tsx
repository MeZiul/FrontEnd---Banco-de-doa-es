import Link from "next/link";
import { ArrowUpRight, CircleHelp, LifeBuoy, ShieldCheck } from "lucide-react";

const rastreadorProjeto = "https://gitlab.fslab.dev/f-brica-de-software-i-2026-1/banco-de-doa-es/frontend-banco-de-doacoes/-/issues/new";

const perguntas = [
  {
    pergunta: "Como encontro uma doação?",
    resposta: <p>Abra <Link href="/busca" className="font-semibold text-blue-800 underline underline-offset-4">a busca de doações</Link>, informe o que procura e refine por categoria, condição ou localização.</p>,
  },
  {
    pergunta: "Como anuncio um item?",
    resposta: <p>Entre na sua conta e escolha “Anunciar uma doação”. Descreva o item com clareza, informe sua condição e publique fotos que ajudem a pessoa interessada a entendê-lo.</p>,
  },
  {
    pergunta: "Como demonstro interesse?",
    resposta: <p>Abra o anúncio e entre na sua conta para enviar uma mensagem de interesse. A pessoa doadora recebe o pedido e decide como continuar.</p>,
  },
  {
    pergunta: "Como denuncio um anúncio ou uma pessoa?",
    resposta: <p>Com uma conta ativa, abra o anúncio e use “Denunciar item ou doador”. Escolha o motivo e descreva o que aconteceu; o relato segue para análise da administração.</p>,
  },
  {
    pergunta: "A Doaí cobra pelos itens ou pela retirada?",
    resposta: <p>Os itens publicados são doações e não podem ser cobrados. A retirada é combinada diretamente entre as pessoas; marque em um local público e seguro.</p>,
  },
];

export function HelpCenter() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-300"><CircleHelp className="size-4" aria-hidden="true" /> Central de ajuda</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Como podemos ajudar?</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Orientações rápidas para encontrar, anunciar e combinar uma doação com cuidado.</p>
      </header>

      <section aria-labelledby="perguntas-titulo" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 id="perguntas-titulo" className="text-xl font-bold text-slate-950">Perguntas frequentes</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {perguntas.map(({ pergunta, resposta }) => (
            <details key={pergunta} className="group py-4 first:pt-2 last:pb-2">
              <summary className="cursor-pointer rounded-lg py-2 text-base font-semibold text-slate-900 underline-offset-4 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800 group-open:text-blue-900">
                {pergunta}
              </summary>
              <div className="max-w-3xl pb-1 pt-3 text-sm leading-relaxed text-slate-700">{resposta}</div>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="seguranca-titulo" className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-sky-200 bg-sky-50 p-6">
          <ShieldCheck className="size-7 text-blue-800" aria-hidden="true" />
          <h2 id="seguranca-titulo" className="mt-4 text-lg font-bold text-slate-950">Combine com segurança</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Prefira locais públicos para a retirada. Evite incluir documentos, endereço completo ou outras informações sensíveis no anúncio.</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/termos" className="text-blue-800 underline underline-offset-4">Termos de uso</Link>
            <Link href="/privacidade" className="text-blue-800 underline underline-offset-4">Privacidade</Link>
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
          <LifeBuoy className="size-7 text-amber-900" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-slate-950">Encontrou um problema no aplicativo?</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Conte à equipe qual página você abriu, o que tentou fazer e o que aconteceu. O registro técnico é feito no rastreador GitLab do projeto e exige acesso ao projeto.</p>
          <a href={rastreadorProjeto} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">
            Relatar problema técnico <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </article>
      </section>
    </div>
  );
}
