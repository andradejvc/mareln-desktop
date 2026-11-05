
import type { Metadata } from "next";
import { Suspense } from "react";

import MapaView from "@/components/mapa/MapaView";

export const metadata: Metadata = {
  title: "Mapa de eventos | Maré LN",
  description: "Encontre eventos no Litoral Norte de São Paulo.",
};

type Props = {
  searchParams: Promise<{ evento?: string | string[] }>;
};

async function MapaConteudo({ searchParams }: Props) {
  const parametros = await searchParams;

  const valorEvento = Array.isArray(parametros.evento)
    ? parametros.evento[0]
    : parametros.evento;

  const idEvento =
    valorEvento && /^\d+$/.test(valorEvento)
      ? Number(valorEvento)
      : null;

  return <MapaView eventoInicialId={idEvento} />;
}

export default function MapaPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-mare-creme">
          <p className="font-titulo text-lg font-bold text-mare-laranja">
            Carregando mapa...
          </p>
        </main>
      }
    >
      <MapaConteudo searchParams={searchParams} />
    </Suspense>
  );
}
