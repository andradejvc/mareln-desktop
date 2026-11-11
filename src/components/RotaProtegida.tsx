"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/lib/usuario";

type DestinoProtegido =
  | "/dashboard"
  | "/explorar"
  | "/perfil"
  | "/favoritos"
  | "/divulgar-evento"
  | "/meus-eventos"
  | `/eventos/${number}`;

type Props = {
  children: ReactNode;
  destinoAposLogin?: DestinoProtegido;
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
