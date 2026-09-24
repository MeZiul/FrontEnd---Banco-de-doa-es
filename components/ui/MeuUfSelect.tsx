import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF",
    "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
    "RO", "RR", "SC", "SP", "SE", "TO",
]

interface UfSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
}

export function UfSelect({
    value,
    onValueChange,
    placeholder = "SELECIONE",
}: UfSelectProps) {
    return (
        <Select
            value={value}
            onValueChange={(newValue) => {
                if (newValue !== null) onValueChange?.(newValue)
            }}
        >
            <SelectTrigger className="bg-background">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                        {estado}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}