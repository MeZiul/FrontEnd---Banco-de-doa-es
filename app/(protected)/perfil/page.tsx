import { redirect } from "next/navigation";

// /perfil não tem tela própria: abre direto na primeira aba do perfil
export default function PerfilPage() {
  redirect("/perfil/meus-anuncios");
}
