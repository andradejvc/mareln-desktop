import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegistroForm from "@/components/auth/RegistroForm";

export const metadata: Metadata = {
  title: "Criar Conta | Maré LN",
};

export default function RegistroPage() {
  return (
    <>

      <AuthCard
        titulo="Criar Conta"
        subtitulo="Junte-se ao Maré LN e descubra os melhores eventos do litoral!"
      >
        <RegistroForm />
      </AuthCard>
 
    </>
  );
}