
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
    categorias,
    cidades,
    type Categoria,
    type Cidade,
} from "@/data/eventos";

import {
    listarEventos,
    type EventoExplorar,
} from "@/lib/eventos-api";

import { useFavoritos } from "@/lib/favoritos";
import { useSessao } from "@/lib/usuario";

import CabecalhoMobile from "@/components/explorar/CabecalhoMobile";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

import {
    IconeBusca,
    IconeCalendario,
    IconeCoracao,
    IconeInicio,
    IconePino,
    IconeUsuario,
} from "@/components/dashboard/icons";

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

const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), {
    ssr: false,
    loading: () => (
        <div className="grid h-full min-h-[460px] place-items-center bg-stone-100 text-sm text-stone-500">
            Preparando mapa...
        </div>
    ),
});

const abas = [
    { href: "/dashboard", label: "Início", Icone: IconeInicio },
    { href: "/explorar", label: "Explorar", Icone: IconeBusca },
    { href: "/mapa", label: "Mapa", Icone: IconePino },
    { href: "/favoritos", label: "Favoritos", Icone: IconeCoracao },
    { href: "/perfil", label: "Perfil", Icone: IconeUsuario },
];

function normalizar(valor: string) {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export default function MapaView({
    eventoInicialId,
}: {
    eventoInicialId: number | null;
}) {
    const router = useRouter();
    const { usuario, pronta } = useSessao();
    const { favoritos, alternarFavorito } = useFavoritos();

    const sessao = !pronta
        ? "carregando"
        : usuario
            ? "logado"
            : "visitante";

    const [eventosApi, setEventosApi] = useState<EventoExplorar[]>([]);
    const [carregandoEventos, setCarregandoEventos] = useState(true);
    const [erroEventos, setErroEventos] = useState<string | null>(null);

    const [busca, setBusca] = useState("");
    const [cidade, setCidade] = useState<Cidade | "todas">("todas");
    const [categoria, setCategoria] = useState<Categoria | "todas">("todas");
    const [filtrosAbertos, setFiltrosAbertos] = useState(false);

    const [eventoSelecionadoId, setEventoSelecionadoId] = useState<
        number | null
    >(eventoInicialId);

    const [localizacaoUsuario, setLocalizacaoUsuario] =
        useState<LocalizacaoUsuario | null>(null);

    const [statusLocalizacao, setStatusLocalizacao] = useState("");
    const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

    // Busca somente os eventos aprovados disponibilizados pela API.
    useEffect(() => {
        let ativo = true;

        async function carregarEventos() {
            try {
                const resposta = await listarEventos();

                if (ativo) {
                    setEventosApi(resposta);
                    setErroEventos(null);
                }
            } catch (erro) {
                if (ativo) {
                    setErroEventos(
                        erro instanceof Error
                            ? erro.message
                            : "Não foi possível carregar os eventos.",
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoEventos(false);
                }
            }
        }

        void carregarEventos();

        return () => {
            ativo = false;
        };
    }, []);

    // O mapa exibe somente eventos que possuem coordenadas válidas.
    const eventosComCoordenadas = useMemo<EventoComCoordenada[]>(
        () =>
            eventosApi.flatMap((evento) => {
                const latitude = evento.latitude;
                const longitude = evento.longitude;

                if (
                    latitude === null ||
                    longitude === null ||
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    return [];
                }

                return [
                    {
                        ...evento,
                        latitude,
                        longitude,
                        precisao:
                            evento.precisaoLocalizacao === "EXATA"
                                ? "referencia"
                                : "aproximada",
                    },
                ];
            }),
        [eventosApi],
    );

    const eventosFiltrados = useMemo(() => {
        const termo = normalizar(busca.trim());

        return eventosComCoordenadas.filter((evento) => {
            if (
                cidade !== "todas" &&
                evento.cidade !== cidade
            ) {
                return false;
            }

            if (
                categoria !== "todas" &&
                evento.categoria !== categoria
            ) {
                return false;
            }

            if (!termo) return true;

            return [
                evento.titulo,
                evento.local,
                evento.cidade ?? "",
                evento.categoria,
            ].some((campo) => normalizar(campo).includes(termo));
        });
    }, [eventosComCoordenadas, busca, cidade, categoria]);

    // Mantém um evento selecionado válido depois da aplicação dos filtros.
    useEffect(() => {
        if (eventoInicialId !== null) {
            const eventoEncontrado = eventosFiltrados.find(
                (evento) => evento.id === eventoInicialId,
            );

            setEventoSelecionadoId(eventoEncontrado?.id ?? null);
        } else if (eventosFiltrados.length > 0) {
            setEventoSelecionadoId((atual) => {
                const existe = eventosFiltrados.some(
                    (evento) => evento.id === atual,
                );

                return existe ? atual : eventosFiltrados[0].id;
            });
        } else {
            setEventoSelecionadoId(null);
        }
    }, [eventoInicialId, eventosFiltrados]);

    const eventoSelecionado =
        eventosFiltrados.find(
            (evento) => evento.id === eventoSelecionadoId,
        ) ?? null;

    function favoritar(id: number) {
        if (sessao === "visitante") {
            router.push(`/login?returnTo=${encodeURIComponent("/mapa")}`);
            return;
        }

        if (sessao === "logado") {
            alternarFavorito(id);
        }
    }

    function solicitarLocalizacao() {
        if (!navigator.geolocation) {
            setStatusLocalizacao(
                "Este navegador não oferece geolocalização.",
            );
            return;
        }

        setBuscandoLocalizacao(true);
        setStatusLocalizacao(
            "Aguardando autorização de localização...",
        );

        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                setLocalizacaoUsuario({
                    latitude: posicao.coords.latitude,
                    longitude: posicao.coords.longitude,
                });

                setStatusLocalizacao(
                    "Sua localização foi exibida no mapa.",
                );

                setBuscandoLocalizacao(false);
            },
            (erro) => {
                const mensagem =
                    erro.code === erro.PERMISSION_DENIED
                        ? "Acesso à localização não autorizado. Você pode permitir nas configurações do navegador."
                        : erro.code === erro.POSITION_UNAVAILABLE
                            ? "Não foi possível determinar sua localização agora."
                            : "A localização demorou demais para responder. Tente novamente.";

                setStatusLocalizacao(mensagem);
                setBuscandoLocalizacao(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 60000,
            },
        );
    }

    function limparFiltros() {
        setBusca("");
        setCidade("todas");
        setCategoria("todas");
    }

    const quantidadeFiltrosAtivos =
        (cidade !== "todas" ? 1 : 0) +
        (categoria !== "todas" ? 1 : 0);

    return (
        <div className="mx-auto w-full max-w-xl pb-24 lg:max-w-7xl lg:px-6 lg:py-5">
            <div className="lg:hidden">
                <CabecalhoMobile
                    sessao={sessao}
                    paginaAtiva="Mapa"
                />
            </div>

            <div className="hidden lg:block">
                <DashboardNavbar
                    sessao={sessao}
                    nomeUsuario={usuario?.nome}
                    totalFavoritos={
                        sessao === "logado" ? favoritos.length : 0
                    }
                    paginaAtiva="Mapa"
                />
            </div>

            <main className="px-4 pt-7 sm:px-5 lg:px-0 lg:pt-10">
                <header className="mb-5 text-center lg:mb-6 lg:text-left">
                    <h1 className="font-titulo text-2xl uppercase tracking-wide text-mare-rosa sm:text-3xl">
                        Mapa de eventos
                    </h1>

                    <p className="mt-1 text-sm text-stone-500">
                        Explore eventos pelo Litoral Norte de São Paulo.
                    </p>
                </header>

                <div className="relative z-30 mb-4 flex items-center gap-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-stone-200 bg-white px-4 py-3 text-stone-400 shadow-sm focus-within:border-mare-laranja">
                        <IconeBusca size={17} />

                        <span className="sr-only">
                            Buscar eventos no mapa
                        </span>

                        <input
                            type="search"
                            value={busca}
                            onChange={(evento) =>
                                setBusca(evento.target.value)
                            }
                            placeholder="Buscar eventos..."
                            className="w-full min-w-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
                        />
                    </label>

                    <button
                        type="button"
                        aria-label="Abrir filtros"
                        aria-expanded={filtrosAbertos}
                        onClick={() =>
                            setFiltrosAbertos((aberto) => !aberto)
                        }
                        className={`relative grid size-12 shrink-0 place-items-center rounded-full bg-white text-mare-rosa shadow-sm transition hover:bg-rose-50 ${filtrosAbertos || quantidadeFiltrosAtivos > 0
                            ? "ring-2 ring-mare-rosa/30"
                            : ""
                            }`}
                    >
                        <svg
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <path d="M4 6h9M19 6h1M4 12h3M13 12h7M4 18h11M21 18h-1" />
                            <circle cx="16" cy="6" r="2" />
                            <circle cx="10" cy="12" r="2" />
                            <circle cx="18" cy="18" r="2" />
                        </svg>

                        {quantidadeFiltrosAtivos > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-mare-rosa text-[9px] font-bold text-white">
                                {quantidadeFiltrosAtivos}
                            </span>
                        )}
                    </button>

                    {filtrosAbertos && (
                        <section className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-stone-100 bg-white p-4 shadow-xl">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="font-bold text-stone-800">
                                    Filtrar eventos
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setFiltrosAbertos(false)}
                                    className="text-xs font-semibold text-stone-400 hover:text-stone-700"
                                >
                                    Fechar
                                </button>
                            </div>

                            <label className="block text-xs font-semibold text-stone-600">
                                Cidade

                                <select
                                    value={cidade}
                                    onChange={(evento) =>
                                        setCidade(
                                            evento.target.value as
                                            | Cidade
                                            | "todas",
                                        )
                                    }
                                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal text-stone-800 outline-none focus:border-mare-laranja"
                                >
                                    <option value="todas">
                                        Todas as cidades
                                    </option>

                                    {cidades.map((nome) => (
                                        <option key={nome} value={nome}>
                                            {nome}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="mt-4">
                                <p className="mb-2 text-xs font-semibold text-stone-600">
                                    Categoria
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        aria-pressed={categoria === "todas"}
                                        onClick={() => setCategoria("todas")}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${categoria === "todas"
                                            ? "border-mare-rosa bg-mare-rosa text-white"
                                            : "border-stone-200 text-stone-600"
                                            }`}
                                    >
                                        Todas
                                    </button>

                                    {categorias.map((nome) => (
                                        <button
                                            key={nome}
                                            type="button"
                                            aria-pressed={categoria === nome}
                                            onClick={() =>
                                                setCategoria(
                                                    categoria === nome
                                                        ? "todas"
                                                        : nome,
                                                )
                                            }
                                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${categoria === nome
                                                ? "border-mare-rosa bg-mare-rosa text-white"
                                                : "border-stone-200 text-stone-600"
                                                }`}
                                        >
                                            {nome}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                                <button
                                    type="button"
                                    onClick={limparFiltros}
                                    className="text-xs font-semibold text-stone-500 underline underline-offset-2"
                                >
                                    Limpar filtros
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFiltrosAbertos(false)}
                                    className="rounded-full bg-mare-laranja px-4 py-2 text-xs font-bold text-white"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {statusLocalizacao && (
                    <p
                        role="status"
                        className="mb-3 rounded-xl bg-white px-3 py-2 text-xs text-stone-600 shadow-sm"
                    >
                        {statusLocalizacao}
                    </p>
                )}

                {erroEventos && (
                    <p
                        role="alert"
                        className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {erroEventos}
                    </p>
                )}

                {carregandoEventos && (
                    <p
                        role="status"
                        className="mb-3 rounded-xl bg-white px-4 py-3 text-sm text-stone-500 shadow-sm"
                    >
                        Carregando eventos do servidor...
                    </p>
                )}

                <section
                    aria-label="Mapa de eventos do Litoral Norte"
                    className="relative isolate h-[520px] overflow-hidden rounded-2xl bg-stone-100 shadow-md shadow-orange-900/10 sm:h-[580px] lg:h-[650px] lg:rounded-3xl"
                >
                    {process.env.NEXT_PUBLIC_MAPTILER_KEY ? (
                        <MapaLeaflet
                            eventos={eventosFiltrados}
                            eventoInicialId={eventoInicialId}
                            onSelecionar={setEventoSelecionadoId}
                            localizacaoUsuario={localizacaoUsuario}
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                            <div className="grid size-14 place-items-center rounded-full bg-white text-mare-laranja shadow-sm">
                                <IconePino size={26} />
                            </div>

                            <h2 className="mt-4 font-titulo text-xl text-stone-800">
                                Configure o mapa para visualizar os eventos
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                                Adicione sua chave do MapTiler em{" "}
                                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                                    NEXT_PUBLIC_MAPTILER_KEY
                                </code>{" "}
                                no arquivo{" "}
                                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                                    .env.local
                                </code>{" "}
                                e reinicie o servidor.
                            </p>
                        </div>
                    )}

                    {process.env.NEXT_PUBLIC_MAPTILER_KEY && (
                        <button
                            type="button"
                            onClick={solicitarLocalizacao}
                            disabled={buscandoLocalizacao}
                            className="absolute right-3 top-3 z-[1100] grid size-11 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-lg transition hover:bg-orange-50 disabled:cursor-wait disabled:opacity-60"
                            aria-label="Mostrar minha localização"
                            title="Mostrar minha localização"
                        >
                            {buscandoLocalizacao ? (
                                <span className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-mare-laranja" />
                            ) : (
                                <svg
                                    width="21"
                                    height="21"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                                    <circle cx="12" cy="12" r="8" />
                                </svg>
                            )}
                        </button>
                    )}

                    {eventoSelecionado && (
                        <article className="absolute inset-x-3 bottom-3 z-[1100] flex min-h-[116px] items-center gap-3 rounded-2xl border border-white/80 bg-white p-3 pr-12 shadow-[0_8px_30px_rgba(0,0,0,0.20)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[390px]">
                            <div className="relative h-[82px] w-[112px] shrink-0 overflow-hidden rounded-xl">
                                <Image
                                    src={eventoSelecionado.imagem}
                                    alt={eventoSelecionado.titulo}
                                    fill
                                    sizes="112px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-mare-rosa">
                                    {eventoSelecionado.categoria}
                                </p>

                                <h2 className="mt-1 line-clamp-2 font-card text-base font-bold leading-tight text-stone-900">
                                    {eventoSelecionado.titulo}
                                </h2>

                                <p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
                                    <IconeCalendario size={12} />
                                    {eventoSelecionado.data} •{" "}
                                    {eventoSelecionado.hora}
                                </p>

                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-500">
                                    <IconePino size={12} />
                                    {eventoSelecionado.local},{" "}
                                    {eventoSelecionado.cidade ??
                                        "Cidade não informada"}
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    {eventoSelecionado.precisao ===
                                        "aproximada" && (
                                            <span className="text-[9px] text-amber-700">
                                                Local aproximado
                                            </span>
                                        )}

                                    <Link
                                        href={`/eventos/${eventoSelecionado.id}`}
                                        className="ml-auto text-[10px] font-bold uppercase text-mare-rosa hover:underline"
                                    >
                                        Ver detalhes ›
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="button"
                                aria-label={
                                    favoritos.includes(eventoSelecionado.id)
                                        ? "Remover dos favoritos"
                                        : "Adicionar aos favoritos"
                                }
                                aria-pressed={favoritos.includes(eventoSelecionado.id)}
                                onClick={() => favoritar(eventoSelecionado.id)}
                                className={`absolute right-2 top-2 z-20 grid size-8 place-items-center rounded-full shadow transition ${favoritos.includes(eventoSelecionado.id)
                                    ? "bg-rose-100 text-mare-rosa"
                                    : "bg-white text-stone-500 hover:bg-rose-50 hover:text-mare-rosa"
                                    }`}
                            >
                                <IconeCoracao size={17} />
                            </button>
                        </article>
                    )}

                    {!carregandoEventos &&
                        eventosFiltrados.length === 0 &&
                        !erroEventos &&
                        process.env.NEXT_PUBLIC_MAPTILER_KEY && (
                            <div className="absolute inset-x-4 top-4 z-[1100] rounded-xl bg-white/95 p-4 text-center shadow-lg">
                                <p className="text-sm font-semibold text-stone-800">
                                    {eventosComCoordenadas.length === 0
                                        ? "Ainda não existem eventos aprovados com localização cadastrada."
                                        : "Nenhum evento encontrado com esses filtros."}
                                </p>

                                <button
                                    type="button"
                                    onClick={limparFiltros}
                                    className="mt-2 text-xs font-bold text-mare-rosa underline"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                </section>

                {eventosFiltrados.some(
                    (evento) => evento.precisao === "aproximada",
                ) && (
                        <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
                            Alguns marcadores são aproximados porque o local
                            informado não possui confirmação de ponto exato.
                            Confira o local com a organização antes de se deslocar.
                        </p>
                    )}

                <div className="mt-4 flex items-center justify-between text-xs text-stone-500 lg:mt-5">
                    <span>
                        {eventosFiltrados.length}{" "}
                        {eventosFiltrados.length === 1
                            ? "evento encontrado"
                            : "eventos encontrados"}
                    </span>

                    {(busca || quantidadeFiltrosAtivos > 0) && (
                        <button
                            type="button"
                            onClick={limparFiltros}
                            className="font-semibold text-mare-rosa hover:underline"
                        >
                            Limpar busca e filtros
                        </button>
                    )}
                </div>
            </main>

            <nav
                aria-label="Navegação principal"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
            >
                <ul className="mx-auto flex max-w-xl items-stretch justify-around">
                    {abas.map(({ href, label, Icone }) => {
                        const ativo = label === "Mapa";

                        return (
                            <li key={label} className="flex-1">
                                <Link
                                    href={href}
                                    aria-current={ativo ? "page" : undefined}
                                    className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${ativo
                                        ? "font-bold text-mare-laranja"
                                        : "text-stone-400"
                                        }`}
                                >
                                    <Icone size={22} />
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
