
"use client";

import { useEffect, useRef, useState } from "react";

import type {
    Map as LeafletMap,
    Marker,
} from "leaflet";

import type { Cidade } from "@/data/eventos";

export type CoordenadaSelecionada = {
    latitude: number;
    longitude: number;
};

type Props = {
    cidade: Cidade;
    onSelecionar: (coordenadas: CoordenadaSelecionada) => void;
};

type ModuloLeaflet = typeof import("leaflet");

const centrosCidades: Record<Cidade, [number, number]> = {
    Caraguatatuba: [-23.6207, -45.413],
    "São Sebastião": [-23.8, -45.41],
    Ilhabela: [-23.778, -45.355],
    Ubatuba: [-23.433, -45.083],
};

export default function SelecionarLocalizacaoLeaflet({
    cidade,
    onSelecionar,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapaRef = useRef<LeafletMap | null>(null);
    const marcadorRef = useRef<Marker | null>(null);
    const callbackRef = useRef(onSelecionar);

    const [mapaPronto, setMapaPronto] = useState(false);
    const [erroMapa, setErroMapa] = useState("");

    useEffect(() => {
        callbackRef.current = onSelecionar;
    }, [onSelecionar]);

    useEffect(() => {
        let cancelado = false;

        async function iniciarMapa() {
            const apiKey =
                process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

            if (!apiKey) {
                setErroMapa(
                    "A chave do MapTiler não está configurada.",
                );
                return;
            }

            try {
                const Leaflet: ModuloLeaflet =
                    await import("leaflet");

                if (cancelado || !containerRef.current) return;

                // Ícone próprio: evita as requisições dos PNGs padrão do Leaflet.
                const iconeMarcador = Leaflet.divIcon({
                    className: "mare-manual-marker-icon",
                    html: `
                        <svg
                            width="38"
                            height="46"
                            viewBox="0 0 38 46"
                            xmlns="http://www.w3.org/2000/svg"
                            style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"
                        >
                            <path
                                d="M19 1C9.1 1 2 8.2 2 17.2C2 29 19 44 19 44C19 44 36 29 36 17.2C36 8.2 28.9 1 19 1Z"
                                fill="#e85d2a"
                                stroke="#ffffff"
                                stroke-width="2"
                            />
                            <circle
                                cx="19"
                                cy="17"
                                r="6"
                                fill="#ffffff"
                            />
                        </svg>
                    `,
                    iconSize: [38, 46],
                    iconAnchor: [19, 44],
                });

                const mapa = Leaflet.map(
                    containerRef.current,
                    {
                        center: centrosCidades[cidade],
                        zoom: 14,
                        scrollWheelZoom: true,
                        zoomControl: true,
                    },
                );

                const camadaBase = Leaflet.tileLayer(
                    `https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${encodeURIComponent(apiKey)}`,
                    {
                        minZoom: 1,
                        maxZoom: 20,
                        attribution:
                            '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>',
                    },
                );

                camadaBase.on("tileerror", () => {
                    if (!cancelado) {
                        setErroMapa(
                            "Não foi possível carregar o mapa. Verifique sua conexão e a chave do MapTiler.",
                        );
                    }
                });

                camadaBase.on("load", () => {
                    if (!cancelado) {
                        setErroMapa("");
                    }
                });

                camadaBase.addTo(mapa);

                mapa.on("click", (evento) => {
                    const coordenadas = {
                        latitude: evento.latlng.lat,
                        longitude: evento.latlng.lng,
                    };

                    if (marcadorRef.current) {
                        marcadorRef.current.setLatLng(
                            evento.latlng,
                        );
                    } else {
                        marcadorRef.current = Leaflet.marker(
                            evento.latlng,
                            {
                                draggable: true,
                                icon: iconeMarcador,
                            },
                        ).addTo(mapa);

                        marcadorRef.current.on("dragend", () => {
                            const posicao =
                                marcadorRef.current?.getLatLng();

                            if (!posicao) return;

                            callbackRef.current({
                                latitude: posicao.lat,
                                longitude: posicao.lng,
                            });
                        });
                    }

                    callbackRef.current(coordenadas);
                });

                mapaRef.current = mapa;
                setMapaPronto(true);
            } catch {
                if (!cancelado) {
                    setErroMapa(
                        "Não foi possível iniciar o mapa interativo.",
                    );
                }
            }
        }

        void iniciarMapa();

        return () => {
            cancelado = true;

            mapaRef.current?.remove();

            mapaRef.current = null;
            marcadorRef.current = null;
        };
    }, [cidade]);

    return (
        <section className="space-y-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-sm font-bold text-stone-800">
                    Marque o local do evento no mapa
                </p>

                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                    Navegue até o endereço correto e clique no ponto
                    onde o evento acontecerá. Você poderá arrastar
                    o marcador para ajustar a posição.
                </p>
            </div>

            <div className="relative h-[360px] overflow-hidden rounded-2xl border border-stone-200">
                <div
                    ref={containerRef}
                    role="application"
                    aria-label={`Seletor de localização em ${cidade}`}
                    className="mare-leaflet-map h-full w-full"
                />

                {erroMapa && (
                    <p
                        role="alert"
                        className="absolute inset-x-3 top-3 z-[1100] rounded-xl bg-white/95 px-4 py-3 text-xs font-semibold text-red-700 shadow-lg"
                    >
                        {erroMapa}
                    </p>
                )}
            </div>

            <p
                role="status"
                className="text-xs text-stone-500"
            >
                {mapaPronto
                    ? "Mapa carregado. Clique para selecionar uma posição."
                    : "Preparando mapa..."}
            </p>
        </section>
    );
}
