"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { desativarConta } from "@/app/(protected)/perfil/editar/actions";

export function DesativarContaForm() {
    const [aberto, setAberto] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [pendente, iniciarDesativacao] = useTransition();

    function confirmarDesativacao() {
        setErro(null);

        iniciarDesativacao(async () => {
            try {
                const resultado = await desativarConta();

                if (!resultado.sucesso) {
                    setErro(resultado.mensagem);
                }
            } catch (erro) {
                unstable_rethrow(erro);
                setErro("Não foi possível desativar a conta. Tente novamente.");
            }
        });
    }

    return (
        <section className="space-y-4 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="size-5" />
                <h2 className="text-lg font-semibold">
                    Desativar conta
                </h2>
            </div>

            <p className="text-sm text-slate-500">
                Ao desativar sua conta, você perderá o acesso às funcionalidades que exigem autenticação no Doaí e todas as suas sessões serão encerradas.
            </p>

            <AlertDialog
                open={aberto}
                onOpenChange={(valor) => {
                    if (pendente) return;

                    setAberto(valor);
                    setErro(null);
                }}
            >
                <AlertDialogTrigger
                    render={
                        <Button
                            type="button"
                            variant="destructive"
                            data-test="botao-desativar-conta"
                        />
                    }
                >
                    Desativar minha conta
                </AlertDialogTrigger>

                <AlertDialogContent data-test="dialog-desativar-conta" aria-busy={pendente}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Deseja desativar sua conta?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Sua conta será desativada e você será desconectado do Doaí. Tem certeza de que deseja continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {erro && (
                        <p role="alert" className="text-sm text-red-600">
                            {erro}
                        </p>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pendente} data-test="botao-cancelar-desativacao">
                            Cancelar
                        </AlertDialogCancel>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={pendente}
                            onClick={confirmarDesativacao}
                            data-test="botao-confirmar-desativacao"
                        >
                            {pendente
                                ? "Desativando..."
                                : "Confirmar desativação"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}