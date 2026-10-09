
const termos = [
  "O Doaí é uma plataforma gratuita que conecta pessoas dispostas a doar itens a pessoas que precisam deles. Não é permitida a cobrança de qualquer valor pelos itens anunciados.",
  "A retirada dos itens é combinada diretamente entre doador e interessado. Recomendamos encontros em locais públicos e seguros.",
  "Anúncios com produtos ilegais, perigosos ou em condições impróprias de uso serão removidos e a conta poderá ser suspensa.",
];

export default function TermosPage() {
  return (
    <div className="w-full">
      {/* Cabeçalho da Página */}
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Termos de Uso</h1>

      {/* Texto dos Termos */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {termos.map((paragrafo) => (
          <p key={paragrafo} className="text-sm leading-relaxed text-gray-600">
            {paragrafo}
          </p>
        ))}
      </div>
    </div>
  );
}
