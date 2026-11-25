
import type { Metadata } from "next";

import ModeracaoEventosView from "@/components/admin/ModeracaoEventosView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Moderação de Eventos | Maré LN",
};

export default function ModeracaoEventosPage() {
  return (
    <RotaProtegida destinoAposLogin="/admin/eventos">
      <ModeracaoEventosView />
    </RotaProtegida>
  );
}
