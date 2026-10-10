import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF",
    "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
    "RO", "RR", "SC", "SP", "SE", "TO",
]

interface UfSelectProps {
    id?: string
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    // data-test do gatilho (Cypress). Cada opção recebe "opcaoUf<UF>", ex.: opcaoUfRO
    dataTest?: string
}

export function UfSelect({
    id,
    value,
    onValueChange,
    placeholder = " ",
    dataTest,
}: UfSelectProps) {
    return (
        <Select
            value={value}
            onValueChange={(newValue) => {
                if (newValue !== null) onValueChange?.(newValue)
            }}
        >
            <SelectTrigger id={id} data-test={dataTest} className="bg-background">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                {estados.map((estado) => (
                    <SelectItem key={estado} value={estado} data-test={`opcaoUf${estado}`}>
                        {estado}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
