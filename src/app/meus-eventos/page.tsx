
import type { Metadata } from "next";

import MeusEventosView from "@/components/eventos/MeusEventosView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Meus Eventos | Maré LN",
};

export default function MeusEventosPage() {
  return (
    <RotaProtegida destinoAposLogin="/meus-eventos">
      <MeusEventosView />
    </RotaProtegida>
  );
}
