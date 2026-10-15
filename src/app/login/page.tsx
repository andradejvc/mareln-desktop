import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Maré LN",
};

export default function LoginPage() {
  return (
    <>

      <AuthCard
        titulo="Seja Bem-vindo de volta!"
        subtitulo="Faça login e continue conectado aos melhores eventos do litoral"
      >
        <LoginForm />
      </AuthCard>
 
    </>
  );
}