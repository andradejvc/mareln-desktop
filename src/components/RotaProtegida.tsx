"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/lib/usuario";

type Props = {
  children: ReactNode;
  destinoAposLogin?:
    | "/dashboard"
    | "/explorar"
    | "/perfil"
    | "/favoritos";
};

export default function RotaProtegida({
  children,
  destinoAposLogin = "/dashboard",
}: Props) {
  const router = useRouter();
  const { usuario, pronta } = useSessao();

  useEffect(() => {
    if (pronta && !usuario) {
      router.replace(
        `/login?returnTo=${encodeURIComponent(destinoAposLogin)}`,
      );
    }
  }, [pronta, usuario, router, destinoAposLogin]);

  if (!pronta || !usuario) {
    return (
      <p role="status" className="p-10 text-center text-sm text-stone-600">
        Carregando...
      </p>
    );
  }

  return <>{children}</>;
}