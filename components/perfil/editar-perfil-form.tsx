"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salvarPerfil } from "@/app/(protected)/perfil/editar/actions";
import type { DadosPerfil } from "@/lib/perfil-validation";
import { mascararTelefone, somenteDigitos } from "@/lib/mascaras";
import { UfSelect } from "@/components/shared/uf-select";
import { CidadeSelect } from "@/components/shared/cidade-select";

export function EditarPerfilForm({ perfil }: { perfil: DadosPerfil }) {
  const [dados, setDados] = useState({ ...perfil, telefone: mascararTelefone(perfil.telefone) });
  const campo = (nome: keyof DadosPerfil) => ({
    value: dados[nome],
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setDados((atual) => ({ ...atual, [nome]: event.target.value })),
  });
  // Trocar de estado limpa a cidade (a lista de cidades muda junto).
  const mudarUf = (uf: string) =>
    setDados((atual) => ({ ...atual, uf, cidade: atual.uf === uf ? atual.cidade : "" }));
  const [resultado, action, pending] = useActionState(salvarPerfil, {
    sucesso: false,
    mensagem: "",
  });
  return (
    <form
      action={action}
      aria-busy={pending}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-sm text-slate-500">
        Atualize seus dados de contato e sua apresentação. O CPF e as permissões
        da conta são preservados.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="perfil-nome">Nome completo</Label>
          <Input
            id="perfil-nome"
            name="nome"
            {...campo("nome")}
            autoComplete="name"
            minLength={3}
            maxLength={100}
            required
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perfil-email">E-mail</Label>
          <Input
            id="perfil-email"
            name="email"
            {...campo("email")}
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perfil-telefone">Telefone (opcional)</Label>
          <Input
            id="perfil-telefone"
            value={dados.telefone}
            onChange={(event) => setDados((atual) => ({ ...atual, telefone: mascararTelefone(event.target.value) }))}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(69) 99999-0000"
            disabled={pending}
          />
          {/* Envia só os números, como no cadastro. */}
          <input type="hidden" name="telefone" value={somenteDigitos(dados.telefone)} />
        </div>
        {/* A UF vem antes: a lista de cidades depende do estado escolhido. */}
        <div className="space-y-2">
          <Label htmlFor="perfil-uf">Estado (UF)</Label>
          <UfSelect id="perfil-uf" value={dados.uf} onValueChange={mudarUf} placeholder="Selecione a UF" />
          <input type="hidden" name="uf" value={dados.uf} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perfil-cidade">Cidade</Label>
          <CidadeSelect
            id="perfil-cidade"
            uf={dados.uf}
            value={dados.cidade}
            onValueChange={(cidade) => setDados((atual) => ({ ...atual, cidade }))}
          />
          <input type="hidden" name="cidade" value={dados.cidade} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="perfil-bio">Sobre você (opcional)</Label>
          <textarea
            id="perfil-bio"
            name="bio"
            {...campo("bio")}
            maxLength={500}
            rows={4}
            disabled={pending}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
          />
          <p className="text-xs text-slate-500">Até 500 caracteres.</p>
        </div>
      </div>
      {resultado.mensagem && (
        <p
          role={resultado.sucesso ? "status" : "alert"}
          className={
            resultado.sucesso
              ? "text-sm text-green-700"
              : "text-sm text-red-600"
          }
        >
          {resultado.mensagem}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#2973ba] text-white hover:bg-[#1e5bb4]"
        >
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
        <Link
          href="/perfil/meus-anuncios"
          className="text-sm text-blue-700 hover:underline"
        >
          Voltar aos meus anúncios
        </Link>
        <Link
          href="/esqueci-senha"
          className="text-sm text-blue-700 hover:underline"
        >
          Redefinir minha senha
        </Link>
      </div>
    </form>
  );
}