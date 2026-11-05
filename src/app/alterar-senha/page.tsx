
import type { Metadata } from "next";
import { AlterarSenhaForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Alterar senha | Maré LN",
};

export default function AlterarSenhaPage() {
  return <AlterarSenhaForm />;
}
