import { Suspense } from "react";
import type { Metadata } from "next";
import { AlterarSenhaForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Alterar senha | Maré LN",
};

export default function AlterarSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fc]" />}>
      <AlterarSenhaForm />
    </Suspense>
  );
}
