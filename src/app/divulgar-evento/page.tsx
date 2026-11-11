
import type { Metadata } from "next";

import DivulgarEventoView from "@/components/eventos/DivulgarEventoView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Divulgar Evento | Maré LN",
};

export default function DivulgarEventoPage() {
  return (
    <RotaProtegida destinoAposLogin="/divulgar-evento">
      <DivulgarEventoView />
    </RotaProtegida>
  );
}
