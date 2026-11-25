
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
    cidades,
    type Cidade,
} from "@/data/eventos";

import type { EventoDashboard } from "@/data/dashboard";
import type { Categoria } from "@/data/eventos";

import { listarEventos } from "@/lib/eventos-api";
import { useUsuario } from "@/lib/usuario";
import { useFavoritos } from "@/lib/favoritos";

import DashboardMobile from "./DashboardMobile";
import DashboardNavbar from "./DashboardNavbar";

import {
    IconeCalendario,
    IconeCoracao,
    IconePino,
} from "./icons";

import {
    BannerMapa,
    BotaoFavorito,
    Chip,
    LinkDetalhesEvento,
} from "./partes";

// Retorna a data no formato YYYY-MM-DD considerando São Paulo.
function obterChaveDataSaoPaulo(data: string | Date): string {
    const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(data));

    const ano = partes.find((parte) => parte.type === "year")?.value;
    const mes = partes.find((parte) => parte.type === "month")?.value;
    const dia = partes.find((parte) => parte.type === "day")?.value;

    if (!ano || !mes || !dia) {
        return "";
    }

    return `${ano}-${mes}-${dia}`;
}

function obterDataDeHoje(): string {
    const data = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        timeZone: "America/Sao_Paulo",
    }).format(new Date());

    return data.charAt(0).toUpperCase() + data.slice(1);
}

function Miniatura({
    evento,
    tamanho = "size-10",
}: {
    evento: EventoDashboard;
    tamanho?: string;
}) {
    return (
        <div
            className={`relative shrink-0 overflow-hidden rounded-lg ${tamanho}`}
        >
            <Image
                src={evento.imagem}
                alt={evento.titulo}
                fill
                sizes="48px"
                className="object-cover"
            />
        </div>
    );
}

function CardSidebar({
    id,
    titulo,
    acao,
    children,
}: {
    id?: string;
    titulo: string;
    acao?: {
        href: string;
        label: string;
    };
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            className="rounded-2xl bg-white p-5 shadow-sm shadow-orange-900/5"
        >
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-titulo text-xl">
                    {titulo}
                </h2>

                {acao && (
                    <Link
                        href={acao.href}
                        className="text-xs font-medium text-mare-rosa hover:underline"
                    >
                        {acao.label}
                    </Link>
                )}
            </div>

            {children}
        </section>
    );
}

export default function DashboardView() {
    const usuario = useUsuario();
    const nomeUsuario = usuario?.nome ?? "Visitante";

    const [cidade, setCidade] = useState<Cidade | null>(null);

    const { favoritos, alternarFavorito } = useFavoritos();

    const [eventosApi, setEventosApi] = useState<
        EventoDashboard[]
    >([]);

    const [carregandoEventos, setCarregandoEventos] =
        useState(true);

    const [erroEventos, setErroEventos] = useState<string | null>(
        null,
    );

    // A data atual é sempre calculada no fuso horário de São Paulo.
    const chaveHoje = obterChaveDataSaoPaulo(new Date());
    const dataDeHoje = obterDataDeHoje();

    // Busca os eventos aprovados diretamente do backend.
    useEffect(() => {
        let ativo = true;

        async function carregarEventos() {
            try {
                const resposta = await listarEventos();

                if (!ativo) return;

                const eventosConvertidos: EventoDashboard[] =
                    resposta.map((evento) => ({
                        ...evento,
                        hoje:
                            obterChaveDataSaoPaulo(evento.dataISO) ===
                            chaveHoje,
                    }));

                setEventosApi(eventosConvertidos);
                setErroEventos(null);
            } catch (erro) {
                if (!ativo) return;

                setErroEventos(
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível carregar os eventos.",
                );
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
    }, [chaveHoje]);

    // Eventos que acontecem hoje.
    const hoje = useMemo(
        () =>
            eventosApi
                .filter(
                    (evento) =>
                        evento.hoje &&
                        (!cidade || evento.cidade === cidade),
                )
                .sort(
                    (a, b) =>
                        new Date(a.dataISO).getTime() -
                        new Date(b.dataISO).getTime(),
                ),
        [eventosApi, cidade],
    );

    // Eventos futuros, excluindo os que acontecem hoje.
    const proximos = useMemo(
        () =>
            eventosApi
                .filter((evento) => {
                    const dataEvento = obterChaveDataSaoPaulo(
                        evento.dataISO,
                    );

                    return (
                        dataEvento > chaveHoje &&
                        (!cidade || evento.cidade === cidade)
                    );
                })
                .sort(
                    (a, b) =>
                        new Date(a.dataISO).getTime() -
                        new Date(b.dataISO).getTime(),
                ),
        [eventosApi, cidade, chaveHoje],
    );

    // Favoritos são relacionados aos eventos reais retornados pela API.
    const meusFavoritos = useMemo(
        () =>
            eventosApi.filter((evento) =>
                favoritos.includes(evento.id),
            ),
        [eventosApi, favoritos],
    );

    // Sugestões são os próximos eventos aprovados disponíveis.
    const sugestoes = proximos.slice(0, 3);

    const destaque = hoje[0];
    const outrosHoje = hoje.slice(1);

    // Quantidade de eventos reais cadastrados em cada cidade.
    const contagem = (nome: Cidade) =>
        eventosApi.filter(
            (evento) => evento.cidade === nome,
        ).length;

    return (
        <>
            {/* MOBILE */}
            <div className="lg:hidden">
                <DashboardMobile
                    nomeUsuario={nomeUsuario}
                    cidade={cidade}
                    onCidade={setCidade}
                    favoritos={favoritos}
                    onFavorito={alternarFavorito}
                    hoje={hoje}
                    sugestoes={sugestoes}
                    meusFavoritos={meusFavoritos}
                    proximos={proximos}
                    carregando={carregandoEventos}
                    erro={erroEventos}
                />
            </div>

            {/* DESKTOP */}
            <div className="mx-auto hidden w-full max-w-7xl px-6 py-5 lg:block">
                <DashboardNavbar
                    nomeUsuario={nomeUsuario}
                    totalFavoritos={favoritos.length}
                />

                <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                            {dataDeHoje}
                        </p>

                        <h1 className="font-titulo mt-1 text-4xl xl:text-5xl">
                            Oi, {nomeUsuario}!
                        </h1>

                        <p className="mt-1 text-sm text-stone-500">
                            O que vamos descobrir hoje no litoral?
                        </p>
                    </div>

                    <Link
                        href="/explorar"
                        className="rounded-xl border-2 border-mare-laranja px-5 py-2.5 text-sm font-bold text-mare-laranja transition-colors hover:bg-mare-laranja hover:text-white"
                    >
                        Ver todos os eventos →
                    </Link>
                </div>

                {erroEventos && (
                    <p
                        role="alert"
                        className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {erroEventos}
                    </p>
                )}

                {carregandoEventos && (
                    <p
                        role="status"
                        className="mt-6 rounded-xl bg-white p-4 text-sm text-stone-500 shadow-sm"
                    >
                        Carregando eventos...
                    </p>
                )}

                <div className="mt-8 grid grid-cols-[minmax(0,1fr)_340px] gap-6">
                    <div className="space-y-10">
                        {/* Acontecendo hoje */}
                        <section aria-labelledby="titulo-hoje">
                            <div className="mb-4 flex items-center justify-between">
                                <h2
                                    id="titulo-hoje"
                                    className="font-titulo text-2xl"
                                >
                                    Acontecendo hoje
                                </h2>

                                <span className="rounded-full bg-mare-rosa/15 px-3 py-1 text-xs font-bold text-mare-rosa">
                                    {hoje.length}{" "}
                                    {hoje.length === 1
                                        ? "evento"
                                        : "eventos"}
                                </span>
                            </div>

                            {destaque ? (
                                <>
                                    <article className="cartao-evento relative h-64 overflow-hidden rounded-3xl">
                                        <Image
                                            src={destaque.imagem}
                                            alt={destaque.titulo}
                                            fill
                                            sizes="(min-width: 1280px) 800px, 640px"
                                            className="object-cover"
                                            priority
                                        />

                                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-black/30" />

                                        <span className="absolute left-4 top-4 rounded-full bg-mare-rosa px-3.5 py-1 text-xs font-bold text-white">
                                            HOJE • {destaque.hora}
                                        </span>

                                        <BotaoFavorito
                                            evento={destaque}
                                            ativo={favoritos.includes(
                                                destaque.id,
                                            )}
                                            onAlternar={alternarFavorito}
                                            escuro
                                            className="absolute right-4 top-4"
                                        />

                                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                            <Chip
                                                categoria={destaque.categoria}
                                            />

                                            <h3 className="mt-2 text-3xl font-bold">
                                                {destaque.titulo}
                                            </h3>

                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                                                <IconePino size={14} />
                                                {destaque.local},{" "}
                                                {destaque.cidade ??
                                                    "Cidade não informada"}
                                            </p>
                                        </div>

                                        <LinkDetalhesEvento
                                            evento={destaque}
                                        />
                                    </article>

                                    {outrosHoje.map((evento) => (
                                        <article
                                            key={evento.id}
                                            className="cartao-evento relative mt-3 flex max-w-sm overflow-hidden rounded-xl bg-white shadow-sm shadow-orange-900/5"
                                        >
                                            <div className="relative w-20 shrink-0">
                                                <Image
                                                    src={evento.imagem}
                                                    alt={evento.titulo}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="p-3">
                                                <Chip
                                                    categoria={evento.categoria}
                                                />

                                                <h3 className="mt-1.5 text-sm font-bold">
                                                    {evento.titulo}
                                                </h3>

                                                <p className="mt-0.5 text-xs text-stone-500">
                                                    {evento.hora} •{" "}
                                                    {evento.cidade ??
                                                        "Cidade não informada"}
                                                </p>
                                            </div>

                                            <LinkDetalhesEvento
                                                evento={evento}
                                            />
                                        </article>
                                    ))}
                                </>
                            ) : (
                                !carregandoEventos &&
                                !erroEventos && (
                                    <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
                                        Não há eventos cadastrados para hoje
                                        {cidade ? ` em ${cidade}` : ""}.
                                    </p>
                                )
                            )}
                        </section>

                        {/* Próximos eventos */}
                        <section aria-labelledby="titulo-proximos">
                            <div className="mb-4 flex items-center justify-between">
                                <h2
                                    id="titulo-proximos"
                                    className="font-titulo text-2xl"
                                >
                                    Próximos eventos

                                    {cidade && (
                                        <span className="ml-2 font-sans text-sm text-stone-500">
                                            em {cidade}
                                        </span>
                                    )}
                                </h2>

                                <Link
                                    href="/explorar"
                                    className="text-sm font-medium text-mare-laranja hover:underline"
                                >
                                    Ver todos →
                                </Link>
                            </div>

                            {proximos.length === 0 ? (
                                !carregandoEventos &&
                                !erroEventos && (
                                    <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
                                        Nenhum evento futuro nessa cidade
                                        por enquanto.
                                    </p>
                                )
                            ) : (
                                <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                                    {proximos.map((evento) => (
                                        <article
                                            key={evento.id}
                                            className="cartao-evento relative overflow-hidden rounded-2xl bg-white shadow-sm shadow-orange-900/5 transition-shadow hover:shadow-md"
                                        >
                                            <div className="relative h-32">
                                                <Image
                                                    src={evento.imagem}
                                                    alt={evento.titulo}
                                                    fill
                                                    sizes="(min-width: 1280px) 280px, 300px"
                                                    className="object-cover"
                                                />

                                                <BotaoFavorito
                                                    evento={evento}
                                                    ativo={favoritos.includes(
                                                        evento.id,
                                                    )}
                                                    onAlternar={
                                                        alternarFavorito
                                                    }
                                                    className="absolute right-2.5 top-2.5"
                                                />
                                            </div>

                                            <div className="space-y-2 p-4">
                                                <Chip
                                                    categoria={evento.categoria}
                                                />

                                                <h3 className="text-sm font-bold leading-snug">
                                                    {evento.titulo}
                                                </h3>

                                                <p className="flex items-center gap-1.5 text-xs text-stone-500">
                                                    <IconeCalendario size={13} />
                                                    {evento.data} às{" "}
                                                    {evento.hora}
                                                </p>

                                                <p className="flex items-center gap-1.5 text-xs text-stone-500">
                                                    <IconePino size={13} />
                                                    {evento.cidade ??
                                                        "Cidade não informada"}
                                                </p>
                                            </div>

                                            <LinkDetalhesEvento
                                                evento={evento}
                                            />
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Barra lateral */}
                    <aside className="space-y-5">
                        <CardSidebar titulo="Filtrar por cidade">
                            <ul className="space-y-1">
                                {cidades.map((nomeCidade) => {
                                    const ativa = cidade === nomeCidade;

                                    return (
                                        <li key={nomeCidade}>
                                            <button
                                                type="button"
                                                aria-pressed={ativa}
                                                onClick={() =>
                                                    setCidade(
                                                        ativa
                                                            ? null
                                                            : nomeCidade,
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors ${
                                                    ativa
                                                        ? "bg-mare-laranja/10 font-bold text-mare-laranja"
                                                        : "text-stone-600 hover:bg-stone-50"
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <IconePino
                                                        size={14}
                                                        className="text-stone-400"
                                                    />
                                                    {nomeCidade}
                                                </span>

                                                <span className="grid size-6 place-items-center rounded-full bg-stone-100 text-xs text-stone-600">
                                                    {contagem(nomeCidade)}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CardSidebar>

                        <CardSidebar
                            id="favoritos"
                            titulo="Meus favoritos"
                            acao={{
                                href: "/favoritos",
                                label: "Ver todos",
                            }}
                        >
                            {meusFavoritos.length === 0 ? (
                                <p className="text-xs text-stone-500">
                                    Toque no coração de um evento para
                                    guardá-lo aqui.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {meusFavoritos.map((evento) => (
                                        <li
                                            key={evento.id}
                                            className="relative flex items-center gap-3"
                                        >
                                            <Miniatura
                                                evento={evento}
                                                tamanho="size-11"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold">
                                                    {evento.titulo}
                                                </p>

                                                <p className="text-xs text-stone-400">
                                                    {evento.data} •{" "}
                                                    {evento.cidade ??
                                                        "Cidade não informada"}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                aria-label={`Remover dos favoritos: ${evento.titulo}`}
                                                onClick={() =>
                                                    alternarFavorito(evento.id)
                                                }
                                                className="relative z-20 text-mare-rosa"
                                            >
                                                <IconeCoracao
                                                    size={16}
                                                    ativo
                                                />
                                            </button>

                                            <LinkDetalhesEvento
                                                evento={evento}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardSidebar>

                        <CardSidebar titulo="Pode te interessar">
                            {sugestoes.length === 0 ? (
                                <p className="text-xs text-stone-500">
                                    Ainda não temos sugestões de eventos futuros.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {sugestoes.map((evento) => (
                                        <li
                                            key={evento.id}
                                            className="relative flex items-center gap-3"
                                        >
                                            <Miniatura
                                                evento={evento}
                                                tamanho="size-11"
                                            />

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold">
                                                    {evento.titulo}
                                                </p>

                                                <p className="text-xs text-stone-400">
                                                    {evento.categoria} •{" "}
                                                    {evento.cidade ??
                                                        "Cidade não informada"}
                                                </p>
                                            </div>

                                            <LinkDetalhesEvento
                                                evento={evento}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardSidebar>

                        <BannerMapa className="h-28" />
                    </aside>
                </div>
            </div>
        </>
    );
}
