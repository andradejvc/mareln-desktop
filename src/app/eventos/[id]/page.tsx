import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { eventos } from "@/data/eventos";
import { detalhesEventos } from "@/data/detalhesEventos";
import EventoDetalheView from "@/components/eventos/EventoDetalheView";
import RotaProtegida from "@/components/RotaProtegida";

type Props = {
  params: Promise<{ id: string }>;
};

function buscarEvento(id: string) {
  if (!/^\d+$/.test(id)) return undefined;
  const idNumerico = Number(id);
  if (!Number.isSafeInteger(idNumerico)) return undefined;
  return eventos.find((evento) => evento.id === idNumerico);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const evento = buscarEvento(id);

  return {
    title: evento ? `${evento.titulo} | Maré LN` : "Evento | Maré LN",
  };
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params;
  const evento = buscarEvento(id);

  if (!evento || !detalhesEventos[evento.id]) {
    notFound();
  }

  return (
    <RotaProtegida destinoAposLogin={`/eventos/${evento.id}`}>
      <EventoDetalheView
        evento={evento}
        detalhes={detalhesEventos[evento.id]}
      />
    </RotaProtegida>
  );
}
