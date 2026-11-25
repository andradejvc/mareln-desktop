
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { eventos } from "@/data/eventos";
import EventoDetalheView from "@/components/eventos/EventoDetalheView";
import RotaProtegida from "@/components/RotaProtegida";

type Props = {
  params: Promise<{ id: string }>;
};

// Mantém a geração inicial das rotas conhecidas.
// Os dados exibidos são sempre consultados na API.
export function generateStaticParams() {
  return eventos.map((evento) => ({
    id: String(evento.id),
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: /^\d+$/.test(id)
      ? `Evento ${id} | Maré LN`
      : "Evento | Maré LN",
  };
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const idNumerico = Number(id);

  if (!Number.isSafeInteger(idNumerico) || idNumerico <= 0) {
    notFound();
  }

  return (
    <RotaProtegida destinoAposLogin={`/eventos/${idNumerico}`}>
      <EventoDetalheView id={idNumerico} />
    </RotaProtegida>
  );
}
