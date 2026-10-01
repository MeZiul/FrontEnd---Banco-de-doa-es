interface AdminUsuarios {
    _id: string;
    nome: string;
    email: string;
    cidade: string;
    uf: string;
    perfil: string;
    situacao: string;
    media_avaliacoes: number;
    total_avaliacoes: number;
    total_doacoes: number;
    data_cadastro: string;
}

interface Props {
    usuario: AdminUsuarios;
}

export default function UsuarioCard({ usuario }: Props) {
    const statusStyle = {
        ATIVO: "bg-green-100 text-green-600",
        SUSPENSO: "bg-red-100 text-red-600",
        INATIVO: "bg-gray-100 text-gray-600",
    };

    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-semibold">{usuario.nome}</h2>

                    <p className="text-sm text-gray-500">
                        {usuario.email} · {usuario.cidade} - {usuario.uf} ·{" "}
                        {usuario.perfil === "USUARIO"
                            ? "Usuário"
                            : usuario.perfil}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyle[
                            usuario.situacao as keyof typeof statusStyle
                        ] ?? "bg-gray-100 text-gray-600"
                    }`}
                >
                    {usuario.situacao}
                </span>
            </div>

            <div className="mt-3 flex gap-2">
                {usuario.situacao === "ATIVO" && (
                    <>
                        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white">
                            Suspender
                        </button>

                        <button className="rounded-xl border px-4 py-2 text-sm">
                            Inativar
                        </button>
                    </>
                )}

                {usuario.situacao === "SUSPENSO" && (
                    <>
                        <button className="rounded-xl border px-4 py-2 text-sm">
                            Reativar
                        </button>

                        <button className="rounded-xl border px-4 py-2 text-sm">
                            Inativar
                        </button>
                    </>
                )}

                {usuario.situacao === "INATIVO" && (
                    <button className="rounded-xl border px-4 py-2 text-sm">
                        Reativar
                    </button>
                )}
            </div>
        </div>
    );
}