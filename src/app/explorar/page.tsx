import type { Metadata } from "next";
import ExplorarView from "@/components/explorar/ExplorarView";

export const metadata: Metadata = {
  title: "Explorar | Maré LN",
};

export default function ExplorarPage() {
  return <ExplorarView />;
}