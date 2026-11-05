import type { Metadata } from "next";
import ExplorarView from "@/components/explorar/ExplorarView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Explorar | Maré LN",
};

export default function ExplorarPage() {
  return (
    <RotaProtegida destinoAposLogin="/explorar">
      <ExplorarView />
    </RotaProtegida>
  );
}