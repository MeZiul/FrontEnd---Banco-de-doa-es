import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>

        {/* Título */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Entrar na sua conta</h1>

          <p className="text-sm text-muted-foreground">Bem-vindo de volta! Preencha seus dados para continuar.</p>
        </div>

        {/* E-mail */}
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>

          <Input id="email" type="email" placeholder="seu@email.com" required />
        </Field>

        {/* Senha */}
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>

          <Input id="password" type="password" required />

          {/* Lembrar / Esqueci a senha */}
          <div className="flex items-center justify-between">
            <label htmlFor="remember"
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
            >
              <input id="remember" type="checkbox"
                className="h-4 w-4 cursor-pointer accent-[#2973ba]"
              />
              Lembrar de mim
            </label>

            <a href="#"
              className="text-sm text-[#2973ba] hover:underline"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </Field>

        {/* Entrar */}
        <Field>
          <Button
            type="submit"
            className="w-full bg-[#2973ba] text-white hover:bg-[#1e5bb4] cursor-pointer"
          >
            Entrar
          </Button>
        </Field>

        {/* Google */}
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

          {/* Cadastro */}
          <FieldDescription className="text-center">
            Não tem uma conta?{" "}
            <a href="#"
              className="text-[#2973ba] font-bold underline underline-offset-4 hover:text-[#1e5bb4]"
            >
              Cadastre-se
            </a>
          </FieldDescription>
        </Field>

      </FieldGroup>
    </form>
  )
}
