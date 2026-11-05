
import type { Metadata } from "next";
import { RecuperarSenhaForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Recuperar senha | Maré LN",
};

export default function RecuperarSenhaPage() {
  return <RecuperarSenhaForm />;
}
