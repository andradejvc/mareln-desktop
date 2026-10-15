"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  categorias,
  cidades,
  eventos,
  type Categoria,
  type Cidade,
} from "@/data/eventos";

// Posição aproximada de cada cidade no mapa (em %). Placeholder até ter um mapa real.
const posicaoNoMapa: Record<Cidade, { left: string; top: string }> = {
  "São Sebastião": { left: "22%", top: "42%" },
  Ilhabela: { left: "30%", top: "68%" },
  Caraguatatuba: { left: "50%", top: "30%" },
  Ubatuba: { left: "78%", top: "52%" },
};

function IconeCoracao({ ativo }: { ativo: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={ativo ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12C19 16.6 12 21 12 21Z" />
    </svg>
  );
}

export default function ExplorarEventos() {
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return eventos.filter((e) => {
      if (cidade && e.cidade !== cidade) return false;
      if (categoria && e.categoria !== categoria) return false;
      if (!termo) return true;
      return [e.titulo, e.local, e.cidade, e.categoria].some((campo) =>
        campo.toLowerCase().includes(termo),
      );
    });
  }, [busca, cidade, categoria]);

  function alternarFavorito(id: number) {
    setFavoritos((atual) =>
      atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id],
    );
  }

  function eventosDaCidade(c: Cidade) {
    return filtrados.filter((e) => e.cidade === c).length;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-6 md:py-10 [&_button]:cursor-pointer">
      <h1 className="font-titulo text-3xl font-bold text-mare-rosa md:text-4xl">
        Explorar
      </h1>

      {/* Busca + botão de filtros */}
      <div className="mt-4 flex items-center gap-3">
        <label className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="sr-only">Buscar eventos</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
          />
        </label>
        <button
          type="button"
          onClick={() => setFiltrosAbertos((v) => !v)}
          aria-expanded={filtrosAbertos}
          aria-label="Filtrar por categoria"
          className={`rounded-full p-2.5 text-mare-rosa focus-visible:outline-2 focus-visible:outline-mare-rosa ${
            filtrosAbertos || categoria ? "bg-mare-rosa/15" : ""
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
        </button>
      </div>

      {filtrosAbertos && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Categorias">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={categoria === c}
              onClick={() => setCategoria(categoria === c ? null : c)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                categoria === c
                  ? "border-mare-rosa bg-mare-rosa text-white"
                  : "border-mare-rosa/40 bg-white text-mare-rosa"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Cidades */}
      <section aria-labelledby="titulo-cidades" className="mt-6">
        <h2 id="titulo-cidades" className="font-titulo mb-3 text-lg font-bold">
          Cidades
        </h2>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-mare-laranja p-4 md:grid-cols-4">
          {cidades.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cidade === c}
              onClick={() => setCidade(cidade === c ? null : c)}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold text-mare-rosa shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                cidade === c ? "bg-white ring-2 ring-mare-rosa" : "bg-mare-creme"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Mapa: só no desktop (no celular existe a aba "Mapa") */}
      <section aria-labelledby="titulo-mapa" className="mt-10 hidden md:block">
        <h2 id="titulo-mapa" className="font-titulo mb-3 text-lg font-bold text-mare-rosa">
          Mapa de eventos
        </h2>
        <div className="relative h-72 overflow-hidden rounded-2xl bg-slate-900">
          {/* TODO: trocar por mapa real (Leaflet/Mapbox/Google Maps) */}
          <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
            <defs>
              <pattern id="grade" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#60a5fa" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grade)" />
          </svg>
          {cidades.map((c) => {
            const total = eventosDaCidade(c);
            if (total === 0) return null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCidade(cidade === c ? null : c)}
                style={posicaoNoMapa[c]}
                aria-label={`${c}: ${total} ${total === 1 ? "evento" : "eventos"}`}
                className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-mare-rosa text-sm font-bold text-white ring-4 ${
                  cidade === c ? "ring-white" : "ring-mare-rosa/40"
                }`}
              >
                {total}
              </button>
            );
          })}
        </div>
      </section>

      {/* Lista de eventos */}
      <section aria-labelledby="titulo-eventos" className="mt-10">
        <h2 id="titulo-eventos" className="font-titulo mb-4 text-lg font-bold md:text-center md:text-xl">
          {cidade ? `Eventos em ${cidade}` : "Próximos eventos"}
        </h2>

        {filtrados.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="font-semibold">Nenhum evento encontrado.</p>
            <p className="mt-1 text-sm text-gray-600">
              Tente outra busca ou limpe os filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setCidade(null);
                setCategoria(null);
              }}
              className="mt-4 rounded-full bg-mare-rosa px-5 py-2 text-sm font-semibold text-white"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 md:grid md:grid-cols-3">
            {filtrados.map((e) => {
              const favorito = favoritos.includes(e.id);
              return (
                <li
                  key={e.id}
                  className="relative flex gap-3 rounded-2xl bg-white p-3 shadow-md md:flex-col md:gap-0 md:p-0 md:overflow-hidden"
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl md:h-40 md:w-full md:rounded-none">
                    <Image
                      src={e.imagem}
                      alt={e.titulo}
                      fill
                      sizes="(min-width: 768px) 33vw, 112px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col md:p-4">
                    <span className="text-xs font-semibold text-mare-rosa">{e.categoria}</span>
                    <h3 className="font-titulo pr-8 text-lg font-bold leading-tight">{e.titulo}</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      {e.data} • {e.hora}
                    </p>
                    <p className="text-xs text-gray-600">
                      {e.local}, {e.cidade}
                    </p>
                    {e.gratuito && (
                      <span className="mt-2 w-fit rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                        GRATUITO
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => alternarFavorito(e.id)}
                    aria-pressed={favorito}
                    aria-label={favorito ? `Remover ${e.titulo} dos favoritos` : `Favoritar ${e.titulo}`}
                    className={`absolute right-3 top-3 rounded-full bg-white p-1.5 shadow focus-visible:outline-2 focus-visible:outline-mare-rosa ${
                      favorito ? "text-mare-rosa" : "text-gray-500"
                    }`}
                  >
                    <IconeCoracao ativo={favorito} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}