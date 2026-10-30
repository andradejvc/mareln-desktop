import type { Metadata } from "next";
import DashboardView from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Início | Maré LN",
};

export default function DashboardPage() {
  return (
    <main>
      <DashboardView />
    </main>
  );
}