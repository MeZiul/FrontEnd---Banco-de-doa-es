
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export function AdminCardHeader() {
    return (
        <Card className="w-full rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-5 sm:p-6 space-y-2">
                <CardTitle className="flex items-center gap-2 text-[#001f3f] text-xl font-bold tracking-tight">
                    <ShieldCheck className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
                    Administração
                </CardTitle>
                    <CardDescription className="text-slate-500 text-sm sm:text-base font-medium">
                        Gestão de contas, moderação de anúncios e resolução de denúncias. Toda ação exige justificativa e fica registrada na trilha de auditoria.
                    </CardDescription>
                </CardHeader>
            </Card>
    );
}