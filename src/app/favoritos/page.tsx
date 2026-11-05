import type { Metadata } from "next";

import FavoritosView from "@/components/favoritos/FavoritosView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Meus Favoritos | Maré LN",
};

export default function FavoritosPage() {
  return (
    <RotaProtegida destinoAposLogin="/favoritos">
      <FavoritosView />
    </RotaProtegida>
  );
}