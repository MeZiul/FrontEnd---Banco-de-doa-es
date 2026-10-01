interface AdminDenuncias {
    _id: string;
    tag: string;
    denunciado: string;
    tipo: string;
    denunciante: string;
    descricao: string;
    situacao: string;
    data_denuncia: string;
}

interface Props {
    denuncia: AdminDenuncias;
}

export default function AdminDenunciaCard({ denuncia }: Props) {
    const statusStyle = {
        EM_ANALISE: "bg-yellow-100 text-black",
        ACOLHIDO: "bg-green-100 text-black",
        REJEITADO: "bg-gray-100 text-black",
    };

    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-semibold">{denuncia.tag}:{denuncia.denunciado}</h2>

                    <p className="text-sm text-gray-500">
                        {denuncia.tipo} · por {denuncia.denunciante} - {denuncia.data_denuncia} ·{" "}
                    </p>
                    <p className="text-m text-gray-500">
                        {denuncia.descricao}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[
                        denuncia.situacao as keyof typeof statusStyle
                        ] ?? "bg-gray-100 text-gray-600"
                        }`}
                >
                    {denuncia.situacao}
                </span>
            </div>

            <div className="mt-3 flex gap-2">
                {denuncia.situacao === "EM_ANALISE" && (
                    <>
                        <button className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white">
                            Acolher denúncoa
                        </button>

                        <button className="rounded-xl border px-4 py-2 text-sm">
                            Rejeitar
                        </button>
                    </>
                )}

                {denuncia.situacao === "REJEITADO" && (
                    <>
                    </>
                )}

                {denuncia.situacao === "ACOLHIDO" && (
                    <button className="rounded-xl border px-4 py-2 text-sm">
                    </button>
                )}
            </div>
        </div>
    );
}