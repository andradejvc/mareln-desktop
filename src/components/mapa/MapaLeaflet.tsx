
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

import type { EventoExplorar } from "@/lib/eventos-api";

type EventoComCoordenada = Omit<
    EventoExplorar,
    "latitude" | "longitude"
> & {
    latitude: number;
    longitude: number;
    precisao: "referencia" | "aproximada";
};

type LocalizacaoUsuario = {
    latitude: number;
    longitude: number;
};

type Props = {
    eventos: EventoComCoordenada[];
    eventoInicialId: number | null;
    onSelecionar: (id: number) => void;
    localizacaoUsuario: LocalizacaoUsuario | null;
};

type GrupoMarcador = {
    latitude: number;
    longitude: number;
    eventos: EventoComCoordenada[];
};

type ModuloLeaflet = typeof import("leaflet");

function escaparHtml(valor: string) {
    return valor
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function criarHtmlPopup(eventos: EventoComCoordenada[]) {
    return `<div class="mare-popup-events">
        ${eventos
            .map(
                (evento) => `
                    <article class="mare-popup-event">
                        <img
                            src="${escaparHtml(evento.imagem)}"
                            alt="${escaparHtml(evento.titulo)}"
                            style="display:block;width:100%;height:115px;object-fit:cover;border-radius:10px;margin-bottom:10px;"
                        />

                        <p class="mare-popup-category">
                            ${escaparHtml(evento.categoria)}
                        </p>

                        <p class="mare-popup-title">
                            ${escaparHtml(evento.titulo)}
                        </p>

                        <p class="mare-popup-location">
                            ${escaparHtml(evento.local)},
                            ${escaparHtml(evento.cidade ?? "Cidade não informada")}
                        </p>

                        <p style="font-size:11px;color:#78716c;margin-top:5px;">
                            ${escaparHtml(evento.data)} • ${escaparHtml(evento.hora)}
                        </p>

                        ${
                            evento.precisao === "aproximada"
                                ? '<p class="mare-popup-approx">Localização aproximada</p>'
                                : ""
                        }

                        <div class="mare-popup-actions">
                            <button
                                type="button"
                                data-selecionar-evento="${evento.id}"
                            >
                                Selecionar
                            </button>

                            <a href="/eventos/${evento.id}">
                                Ver detalhes ›
                            </a>
                        </div>
                    </article>
                `,
            )
            .join("")}
    </div>`;
}

function criarHtmlMarcador(
    evento: EventoComCoordenada,
    quantidade: number,
) {
    const contador =
        quantidade > 1
            ? `<span style="
                position:absolute;
                z-index:3;
                top:-4px;
                right:-5px;
                display:grid;
                width:21px;
                height:21px;
                place-items:center;
                border:2px solid white;
                border-radius:50%;
                background:#e11d48;
                color:white;
                font-size:10px;
                font-weight:800;
            ">${quantidade}</span>`
            : "";

    return `
        <div style="
            position:relative;
            width:48px;
            height:56px;
            filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));
        ">
            <span style="
                position:absolute;
                z-index:0;
                top:31px;
                left:18px;
                width:14px;
                height:14px;
                transform:rotate(45deg);
                background:white;
                border-radius:2px;
            "></span>

            <span style="
                position:absolute;
                z-index:1;
                top:0;
                left:3px;
                width:42px;
                height:42px;
                overflow:hidden;
                border:3px solid white;
                border-radius:50%;
                background:#f5f5f4;
            ">
                <img
                    src="${escaparHtml(evento.imagem)}"
                    alt=""
                    style="
                        display:block;
                        width:100%;
                        height:100%;
                        object-fit:cover;
                    "
                />
            </span>

            ${contador}
        </div>
    `;
}

export default function MapaLeaflet({
    eventos,
    eventoInicialId,
    onSelecionar,
    localizacaoUsuario,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapaRef = useRef<LeafletMap | null>(null);
    const moduloRef = useRef<ModuloLeaflet | null>(null);
    const camadaMarcadoresRef = useRef<LayerGroup | null>(null);
    const camadaUsuarioRef = useRef<LayerGroup | null>(null);

    const [mapaPronto, setMapaPronto] = useState(false);
    const [erroMapa, setErroMapa] = useState("");

    const grupos = useMemo(() => {
        const agrupados = new Map<string, GrupoMarcador>();

        for (const evento of eventos) {
            const chave = `${evento.latitude.toFixed(5)},${evento.longitude.toFixed(5)}`;

            const existente = agrupados.get(chave);

            if (existente) {
                existente.eventos.push(evento);
            } else {
                agrupados.set(chave, {
                    latitude: evento.latitude,
                    longitude: evento.longitude,
                    eventos: [evento],
                });
            }
        }

        return Array.from(agrupados.values());
    }, [eventos]);

    // Leaflet depende de window/document e é carregado somente no navegador.
    useEffect(() => {
        let cancelado = false;

        void import("leaflet")
            .then((Leaflet) => {
                if (cancelado || !containerRef.current) return;

                moduloRef.current = Leaflet;

                const mapa = Leaflet.map(containerRef.current, {
                    center: [-23.62, -45.28],
                    zoom: 9,
                    scrollWheelZoom: true,
                    zoomControl: false,
                });

                const camadaBase = Leaflet.tileLayer(
                    `https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${encodeURIComponent(
                        process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "",
                    )}`,
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
                            "Não foi possível carregar os mapas. Confira a chave do MapTiler e sua conexão.",
                        );
                    }
                });

                camadaBase.on("load", () => {
                    if (!cancelado) {
                        setErroMapa("");
                    }
                });

                camadaBase.addTo(mapa);

                Leaflet.control.zoom({ position: "topleft" }).addTo(mapa);

                mapaRef.current = mapa;

                camadaMarcadoresRef.current =
                    Leaflet.layerGroup().addTo(mapa);

                camadaUsuarioRef.current =
                    Leaflet.layerGroup().addTo(mapa);

                setMapaPronto(true);
            })
            .catch(() => {
                if (!cancelado) {
                    setErroMapa(
                        "Não foi possível iniciar o mapa. Verifique se o Leaflet está instalado corretamente.",
                    );
                }
            });

        return () => {
            cancelado = true;

            mapaRef.current?.remove();

            mapaRef.current = null;
            moduloRef.current = null;
            camadaMarcadoresRef.current = null;
            camadaUsuarioRef.current = null;

            setMapaPronto(false);
        };
    }, []);

    // Atualiza os marcadores sempre que os eventos ou filtros mudarem.
    useEffect(() => {
        const Leaflet = moduloRef.current;
        const mapa = mapaRef.current;
        const camada = camadaMarcadoresRef.current;

        if (!Leaflet || !mapa || !camada || !mapaPronto) return;

        camada.clearLayers();

        for (const grupo of grupos) {
            const primeiroEvento = grupo.eventos[0];

            const icone = Leaflet.divIcon({
                className: "mare-marker-photo-icon",
                html: criarHtmlMarcador(
                    primeiroEvento,
                    grupo.eventos.length,
                ),
                iconSize: [48, 56],
                iconAnchor: [24, 55],
                popupAnchor: [0, -51],
            });

            const marcador = Leaflet.marker(
                [grupo.latitude, grupo.longitude],
                { icon: icone },
            );

            marcador.bindPopup(
                criarHtmlPopup(grupo.eventos),
                { maxWidth: 290 },
            );

            marcador.on("click", () => {
                onSelecionar(primeiroEvento.id);
            });

            marcador.on("popupopen", (eventoPopup) => {
                const elemento = eventoPopup.popup.getElement();

                if (!elemento) return;

                elemento
                    .querySelectorAll<HTMLButtonElement>(
                        "[data-selecionar-evento]",
                    )
                    .forEach((botao) => {
                        botao.addEventListener("click", () => {
                            const id = Number(
                                botao.dataset.selecionarEvento,
                            );

                            if (Number.isSafeInteger(id)) {
                                onSelecionar(id);
                            }
                        });
                    });
            });

            marcador.addTo(camada);
        }

        if (grupos.length === 1) {
            mapa.setView(
                [grupos[0].latitude, grupos[0].longitude],
                13,
            );
        } else if (grupos.length > 1) {
            const limites = Leaflet.latLngBounds(
                grupos.map(
                    (grupo) =>
                        [
                            grupo.latitude,
                            grupo.longitude,
                        ] as [number, number],
                ),
            );

            mapa.fitBounds(limites, {
                padding: [42, 42],
                maxZoom: 10,
            });
        }
    }, [grupos, onSelecionar, mapaPronto]);

    // Centraliza no evento solicitado pela página de detalhes.
    useEffect(() => {
        if (!mapaPronto || eventoInicialId === null) return;

        const mapa = mapaRef.current;

        const eventoInicial = eventos.find(
            (evento) => evento.id === eventoInicialId,
        );

        if (!mapa || !eventoInicial) return;

        mapa.flyTo(
            [eventoInicial.latitude, eventoInicial.longitude],
            13,
            { duration: 0.7 },
        );
    }, [eventoInicialId, eventos, mapaPronto]);

    // Exibe a localização do usuário somente após autorização.
    useEffect(() => {
        const Leaflet = moduloRef.current;
        const mapa = mapaRef.current;
        const camada = camadaUsuarioRef.current;

        if (!Leaflet || !mapa || !camada || !mapaPronto) return;

        camada.clearLayers();

        if (!localizacaoUsuario) return;

        Leaflet.circleMarker(
            [
                localizacaoUsuario.latitude,
                localizacaoUsuario.longitude,
            ],
            {
                radius: 9,
                color: "#ffffff",
                weight: 3,
                fillColor: "#2563eb",
                fillOpacity: 1,
            },
        )
            .bindPopup("Você está aqui")
            .addTo(camada);

        mapa.flyTo(
            [
                localizacaoUsuario.latitude,
                localizacaoUsuario.longitude,
            ],
            14,
            { duration: 0.8 },
        );
    }, [localizacaoUsuario, mapaPronto]);

    return (
        <div className="relative h-full w-full">
            <div
                ref={containerRef}
                role="application"
                aria-label="Mapa interativo de eventos no Litoral Norte"
                className="mare-leaflet-map h-full w-full"
            />

            {erroMapa && (
                <p
                    role="alert"
                    className="absolute inset-x-3 top-3 z-[1000] rounded-xl border border-amber-200 bg-white/95 px-4 py-3 text-center text-xs font-semibold text-amber-800 shadow-lg"
                >
                    {erroMapa}
                </p>
            )}
        </div>
    );
}
