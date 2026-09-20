interface AdminAuditoria {
    titulo: string;
    alvo: string;
    responsavel: string;
    justificativa: string;
    data: string;
}

interface Props {
    auditoria: AdminAuditoria;
}

export default function AuditoriaCard({ auditoria }: Props) {

    return (
        <div className="rounded-2xl border bg-[#edf4fb] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="font-semibold">{auditoria.titulo}</h2>

                    <p className="text-sm text-gray-500">
                        Alvo: {auditoria.alvo} · Responsavel: {auditoria.responsavel}
                    </p>
                    <p className="text-sm text-gray-500">
                        Justificativa: {auditoria.justificativa}
                    </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold  text-gray-600">
                    {auditoria.data}
                </span>
            </div>
        </div>
    );
}