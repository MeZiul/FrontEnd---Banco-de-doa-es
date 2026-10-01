import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditoriaCardProps {
    auditoria: {
        tipo_acao: string;
        tipo_alvo: string;
        alvo_model: string;
        justificativa: string;
        suspensao_ate: string | null;
        resultado_denuncia: string | null;
        resposta_administrativa: string | null;
        acao_tomada: string | null;
        data_acao: string;

        administrador_id: {
            nome: string;
            email: string;
        };

        alvo_id: {
            nome: string;
            email: string;
            perfil: string;
            situacao: string;
        };
    };
}

export default function AuditoriaCard({
    auditoria,
}: AuditoriaCardProps) {
    const dataAcao = new Date(auditoria.data_acao);

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
                        {auditoria.administrador_id.nome}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {auditoria.administrador_id.email}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        Usuário afetado
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {auditoria.alvo_id.nome}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {auditoria.alvo_id.email}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        Justificativa
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {auditoria.justificativa}
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
                            ).toLocaleString("pt-BR")}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}