"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/lib/usuario";

// Só mostra a página para quem está logado; visitante é levado para o login.
export default function RotaProtegida({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { usuario, pronta } = useSessao();

  useEffect(() => {
    if (pronta && !usuario) router.replace("/login");
  }, [pronta, usuario, router]);

  if (!usuario) {
    return (
      <p role="status" className="p-10 text-center text-sm text-stone-600">
        Carregando...
      </p>
    );
  }

  return <>{children}</>;
}