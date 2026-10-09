"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { redefinirSenha, solicitarRecuperacao } from "@/app/(auth)/recuperacao-actions";

export function RecuperacaoForm({ token, redefinicao = false }: { token?: string; redefinicao?: boolean }) {
  const [resultado, action, pending] = useActionState(redefinicao ? redefinirSenha : solicitarRecuperacao, { sucesso: false, mensagem: "" });
  const linkInvalido = redefinicao && (!token || token.length > 512 || /[\s\u0000-\u001f\u007f]/.test(token));
  return <div className="space-y-6">
    <div className="space-y-2"><h1 className="text-2xl font-bold">{redefinicao ? "Redefinir sua senha" : "Recuperar sua senha"}</h1><p className="text-sm text-muted-foreground">{redefinicao ? "Escolha uma nova senha para acessar sua conta." : "Informe o e-mail da sua conta para solicitar um link de recuperação."}</p></div>
    {linkInvalido ? <p role="alert" className="text-sm text-red-600">Link de recuperação inválido. Solicite um novo link.</p> : resultado.sucesso ? <p role="status" className="text-sm text-green-700">{resultado.mensagem}</p> :
      <form action={action} aria-busy={pending} className="space-y-5">
        {resultado.mensagem && <p role="alert" className="text-sm text-red-600">{resultado.mensagem}</p>}
        <FieldGroup>
          {redefinicao ? <>
            <input type="hidden" name="token" value={token ?? ""} />
            <Field><FieldLabel htmlFor="novaSenha">Nova senha</FieldLabel><Input id="novaSenha" name="novaSenha" type="password" autoComplete="new-password" minLength={8} maxLength={128} required disabled={pending} aria-describedby="politicaSenha" /><p id="politicaSenha" className="text-xs text-muted-foreground">De 8 a 128 caracteres, com maiúscula, minúscula, número e um símbolo @$!%*?&.</p></Field>
            <Field><FieldLabel htmlFor="confirmarSenha">Confirmar nova senha</FieldLabel><Input id="confirmarSenha" name="confirmarSenha" type="password" autoComplete="new-password" minLength={8} maxLength={128} required disabled={pending} /></Field>
          </> : <Field><FieldLabel htmlFor="recuperacao-email">E-mail</FieldLabel><Input id="recuperacao-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="seu@email.com" required disabled={pending} /></Field>}
          <Button type="submit" disabled={pending} className="w-full bg-[#2973ba] text-white hover:bg-[#1e5bb4]">{pending ? "Aguarde…" : redefinicao ? "Salvar nova senha" : "Solicitar link de recuperação"}</Button>
        </FieldGroup>
      </form>}
    <div className="flex flex-wrap gap-4 text-sm"><Link href="/login" className="text-[#2973ba] hover:underline">Voltar ao login</Link>{redefinicao && !resultado.sucesso && <Link href="/esqueci-senha" className="text-[#2973ba] hover:underline">Solicitar novo link</Link>}</div>
  </div>;
}
