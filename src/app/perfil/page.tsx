
import type { Metadata } from "next";
import PerfilView from "@/components/perfil/PerfilView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Meu Perfil | Maré LN",
};

export default function PerfilPage() {
  return (
    <main>
      <RotaProtegida destinoAposLogin="/perfil">
        <PerfilView />
      </RotaProtegida>
    </main>
  );
}
