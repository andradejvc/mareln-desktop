import type { Metadata } from "next";
import DashboardView from "@/components/dashboard/DashboardView";
import RotaProtegida from "@/components/RotaProtegida";

export const metadata: Metadata = {
  title: "Início | Maré LN",
};

export default function DashboardPage() {
  return (
    <main>
      <RotaProtegida>
        <DashboardView />
      </RotaProtegida>
    </main>
  );
}