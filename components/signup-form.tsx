import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { UfSelect } from "./ui/MeuUfSelect"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Criar sua conta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Preencha seus dados. Leva menos de dois minutos.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Maria da Silva"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            className="bg-background"
          />
        </Field>
        <div className="flex gap-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              required
              className="bg-background"
            />
          </Field>

          <Field className="flex-1">
            <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
            <Input
              id="telefone"
              type="text"
              placeholder="(00) 00000-0000"
              required
              className="bg-background"
            />
          </Field>
        </div>
        <div className="flex gap-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
            <Input
              id="cidade"
              type="text"
              placeholder="Vilhena"
              required
              className="bg-background"
            />
          </Field>

          <Field className="w-20">
            <FieldLabel htmlFor="estado">UF</FieldLabel>
            <UfSelect />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            className="bg-background"
          />
          <FieldDescription>
            Minimo de 8 caracteres.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar Senha</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            className="bg-background"
          />
          <FieldDescription>Por favor, confirme sua senha.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Criar Conta</Button>
        </Field>
        <FieldSeparator>Ou continuar com</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" className="w-full cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-4"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.79-.07-1.54-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
              />
              <path
                fill="#34A853"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z"
              />
              <path
                fill="#FBBC05"
                d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.88H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.12l3.24-2.53Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.48 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
              />
            </svg>

            Entrar com Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Já tem uma conta? <a href="#">Entrar</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
