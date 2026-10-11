import type { LegalSection } from "@/components/legal/legal-content";

export function LegalDocument({
  title,
  updatedAt,
  introduction,
  sections,
}: {
  title: string;
  updatedAt: string;
  introduction: string;
  sections: readonly LegalSection[];
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-labelledby="documento-titulo">
      <header className="border-b border-slate-200 bg-gradient-to-r from-sky-50 to-white p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Doaí · Informações da plataforma</p>
        <h1 id="documento-titulo" className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">{introduction}</p>
        <p className="mt-4 text-sm text-slate-600">Atualizado em {updatedAt}.</p>
      </header>
      <div className="divide-y divide-slate-200 px-6 sm:px-8">
        {sections.map(section => (
          <section key={section.title} className="py-6 first:pt-7 last:pb-7" aria-labelledby={`secao-${section.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}>
            <h2 id={`secao-${section.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`} className="text-lg font-bold text-slate-950">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
              {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 marker:text-blue-800">
                  {section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
