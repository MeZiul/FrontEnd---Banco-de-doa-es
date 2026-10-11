import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAuditoria } from "@/types/admin-auditoria";

interface AuditoriaCardProps {
    auditoria: AdminAuditoria;
}

export default function AuditoriaCard({
    auditoria,
}: AuditoriaCardProps) {
    const dataAcao = new Date(auditoria.data_acao);
    const administrador = typeof auditoria.administrador_id === "object" ? auditoria.administrador_id : null;
    const alvo = typeof auditoria.alvo_id === "object" ? auditoria.alvo_id : null;
    const nomeAlvo = alvo?.nome || alvo?.titulo || alvo?.motivo || (typeof auditoria.alvo_id === "string" ? auditoria.alvo_id : "Alvo indisponível");

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">

                        <div>
                            <CardTitle className="text-base">
                                {auditoria.tipo_acao.replaceAll("_", " DE ")}
                            </CardTitle>

                            <p className="text-sm text-muted-foreground">
                                {dataAcao.toLocaleString("pt-BR")}
                            </p>
                        </div>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {auditoria.tipo_alvo}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm font-semibold">
                        Administrador
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {administrador?.nome || "Administrador indisponível"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {administrador?.email}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        Alvo da ação · {auditoria.tipo_alvo}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {nomeAlvo}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {alvo?.email}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        Justificativa
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {auditoria.justificativa || "Não informada"}
                    </p>
                </div>

                {auditoria.resultado_denuncia && (
                    <div>
                        <p className="text-sm font-semibold">
                            Resultado da denúncia
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {auditoria.resultado_denuncia}
                        </p>
                    </div>
                )}

                {auditoria.resposta_administrativa && (
                    <div>
                        <p className="text-sm font-semibold">
                            Resposta administrativa
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {auditoria.resposta_administrativa}
                        </p>
                    </div>
                )}

                {auditoria.acao_tomada && (
                    <div>
                        <p className="text-sm font-semibold">
                            Ação tomada
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {auditoria.acao_tomada}
                        </p>
                    </div>
                )}

                {auditoria.suspensao_ate && (
                    <div>
                        <p className="text-sm font-semibold">
                            Suspensão até
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {new Date(
                                auditoria.suspensao_ate
                            ).toLocaleString("pt-br")}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
