import { DoaiIconCustom } from "./ui/doai-icon";

interface EsquedaAutenticacaoProps {
    pagina: "login" | "cadastro";
}

export default function EsquedaAutenticacao({
    pagina,
}: EsquedaAutenticacaoProps) {

    const isLogin = pagina === "login";


    return (
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#2973ba] text-white">
            {/* Topo: Logotipo */}
            <div className="flex items-start">
                <DoaiIconCustom />
            </div>

            {/* Centro: Ilustração da Caixa de Doação */}
            <div className="flex flex-1 items-center justify-center">
                <img
                    src="caixa-doacao.png"
                    alt="Ilustração da Caixa de Doação"
                />
            </div>

            {/* Rodapé: Texto */}
            <div className="max-w-md space-y-3">

                <h2 className="text-2xl font-bold leading-tight">
                    {isLogin
                        ? "O que sobra pra você pode mudar o dia de alguém."
                        : "Comece a doar em poucos minutos."}
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                    {isLogin
                        ? "Conecte-se com pessoas da sua cidade e dê um novo destino ao que você não usa mais."
                        : "Seu cadastro conecta você a pessoas da sua cidade que precisam do que você não usa mais."}
                </p>
            </div>
        </div>
    )
}