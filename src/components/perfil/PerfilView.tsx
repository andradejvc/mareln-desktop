
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";


import {
    cidades,
    categorias,
    eventos,
    type Cidade,
    type Categoria,
} from "@/data/eventos";
import { useUsuario, salvarUsuario } from "@/lib/usuario";
import { useFavoritos } from "@/lib/favoritos";
import {
    lerFotoPerfil,
    salvarFotoPerfil,
    removerFotoPerfil,
} from "@/lib/fotoPerfil";

import DashboardNavbar from "../dashboard/DashboardNavbar";
import {
    IconeBusca,
    IconeCalendario,
    IconeCoracao,
    IconeInicio,
    IconePino,
    IconeSeta,
    IconeUsuario,
} from "../dashboard/icons";

type Preferencias = {
    cidade: Cidade | "";
    interesses: Categoria[];
};

const preferenciasVazias: Preferencias = {
    cidade: "",
    interesses: [],
};

const nomesCategorias: Record<Categoria, string> = {
    Esporte: "Esportes",
    Cultura: "Cultura",
    Natureza: "Natureza",
    Música: "Música",
    Feira: "Feiras",
    Gastronomia: "Gastronomia",
};

function Avatar({
    foto,
    nome,
    tamanho = "size-32",
}: {
    foto: string | null;
    nome: string;
    tamanho?: string;
}) {
    return (
        <div
            className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-4 border-mare-laranja bg-mare-creme text-mare-laranja ${tamanho}`}
        >
            {foto ? (
                <Image
                    src={foto}
                    alt={`Foto de perfil de ${nome}`}
                    width={180}
                    height={180}
                    unoptimized
                    className="h-full w-full object-cover"
                />
            ) : (
                <IconeUsuario size={54} />
            )}
        </div>
    );
}

function BotaoAcao({
    children,
    onClick,
    variante = "claro",
}: {
    children: import("react").ReactNode
    onClick: () => void;
    variante?: "claro" | "vermelho";
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-xl px-5 py-3 text-center font-titulo text-base font-bold transition hover:brightness-95 ${variante === "vermelho"
                    ? "bg-red-700 text-white"
                    : "bg-mare-creme text-stone-900"
                }`}
        >
            {children}
        </button>
    );
}

export default function PerfilView() {
    const router = useRouter();
    const usuario = useUsuario();
    const { favoritos, alternarFavorito } = useFavoritos();

    const nome = usuario?.nome ?? "Usuário";
    const email = usuario?.email ?? "";

    const chaveConta = email || "conta-local";
    const chaveFoto = chaveConta;
    const chavePreferencias = `mareln-perfil-preferencias:${encodeURIComponent(chaveConta)}`;

    const [fotoUrl, setFotoUrl] = useState<string | null>(null);
    const [preferencias, setPreferencias] = useState<Preferencias>(
        preferenciasVazias,
    );

    const [editorAberto, setEditorAberto] = useState(false);
    const [nomeRascunho, setNomeRascunho] = useState(nome);
    const [cidadeRascunho, setCidadeRascunho] = useState<Cidade | "">("");
    const [interessesRascunho, setInteressesRascunho] = useState<Categoria[]>([]);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
    const [removerFoto, setRemoverFoto] = useState(false);

    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);
    const [menuAberto, setMenuAberto] = useState(false);
    const [bannerVisivel, setBannerVisivel] = useState(true);

    const eventosMarcados = useMemo(
        () => eventos.filter((evento) => favoritos.includes(evento.id)),
        [favoritos],
    );

    useEffect(() => {
        let cancelado = false;

        lerFotoPerfil(chaveFoto)
            .then((arquivo) => {
                if (!cancelado && arquivo) {
                    setFotoUrl(URL.createObjectURL(arquivo));
                }
            })
            .catch(() => {
                if (!cancelado) {
                    setAviso("Não foi possível carregar sua foto de perfil.");
                }
            });

        return () => {
            cancelado = true;
        };
    }, [chaveFoto]);

    useEffect(() => {
        return () => {
            if (fotoUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(fotoUrl);
            }
        };
    }, [fotoUrl]);

    useEffect(() => {
        try {
            const salvo = localStorage.getItem(chavePreferencias);

            if (!salvo) {
                setPreferencias(preferenciasVazias);
                return;
            }

            const dados: {
                cidade?: unknown;
                interesses?: unknown;
            } = JSON.parse(salvo);

            const cidadeValida =
                typeof dados.cidade === "string" &&
                    cidades.includes(dados.cidade as Cidade)
                    ? (dados.cidade as Cidade)
                    : "";

            const interessesValidos = Array.isArray(dados.interesses)
                ? dados.interesses.filter(
                    (item): item is Categoria =>
                        typeof item === "string" &&
                        categorias.includes(item as Categoria),
                )
                : [];

            setPreferencias({
                cidade: cidadeValida,
                interesses: interessesValidos,
            });
        } catch {
            setPreferencias(preferenciasVazias);
        }
    }, [chavePreferencias]);

    function abrirEditor() {
        setNomeRascunho(nome);
        setCidadeRascunho(preferencias.cidade);
        setInteressesRascunho([...preferencias.interesses]);
        setFotoPreview(fotoUrl);
        setArquivoFoto(null);
        setRemoverFoto(false);
        setErro("");
        setEditorAberto(true);
    }

    function fecharEditor() {
        setEditorAberto(false);
        setFotoPreview(null);
        setArquivoFoto(null);
        setRemoverFoto(false);
        setErro("");
    }

    function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0];
        event.target.value = "";

        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            setErro("Selecione um arquivo de imagem.");
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            setErro("A imagem deve ter no máximo 5 MB.");
            return;
        }

        const leitor = new FileReader();

        leitor.onload = () => {
            if (typeof leitor.result === "string") {
                setFotoPreview(leitor.result);
                setArquivoFoto(arquivo);
                setRemoverFoto(false);
                setErro("");
            }
        };

        leitor.onerror = () => {
            setErro("Não foi possível abrir essa imagem.");
        };

        leitor.readAsDataURL(arquivo);
    }

    function alternarInteresse(interesse: Categoria) {
        setInteressesRascunho((atuais) =>
            atuais.includes(interesse)
                ? atuais.filter((item) => item !== interesse)
                : [...atuais, interesse],
        );
    }

    async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nomeLimpo = nomeRascunho.trim();

        if (!nomeLimpo) {
            setErro("Informe seu nome.");
            return;
        }

        setSalvando(true);
        setErro("");

        try {
            const novasPreferencias: Preferencias = {
                cidade: cidadeRascunho,
                interesses: interessesRascunho,
            };

            localStorage.setItem(
                chavePreferencias,
                JSON.stringify(novasPreferencias),
            );

            if (usuario) {
                salvarUsuario({
                    nome: nomeLimpo,
                    email: usuario.email,
                });
            }

            if (arquivoFoto) {
                await salvarFotoPerfil(chaveFoto, arquivoFoto);
                setFotoUrl(URL.createObjectURL(arquivoFoto));
            } else if (removerFoto) {
                await removerFotoPerfil(chaveFoto);
                setFotoUrl(null);
            }

            setPreferencias(novasPreferencias);
            fecharEditor();
        } catch {
            setErro(
                "Não foi possível salvar as alterações. Verifique o armazenamento do navegador.",
            );
        } finally {
            setSalvando(false);
        }
    }

    function sairDaConta() {
        try {
            localStorage.removeItem("usuario");
            localStorage.removeItem("isLogged");
            window.dispatchEvent(new Event("usuario-mudou"));
            router.replace("/login");
        } catch {
            setAviso("Não foi possível encerrar a sessão neste navegador.");
        }
    }

    function textoInteresses() {
        return preferencias.interesses.length
            ? preferencias.interesses.map((item) => nomesCategorias[item]).join(", ")
            : "Não definidos";
    }

    function abrirAvisoSenha() {
        setAviso(
            "A alteração de senha ficará disponível quando o sistema de autenticação estiver integrado ao backend.",
        );
    }

    function abrirAvisoDivulgacao() {
        setAviso(
            "A divulgação de eventos por usuários ainda está sendo preparada para uma próxima etapa do Maré LN.",
        );
    }

    const fotoNoEditor = removerFoto ? null : fotoPreview ?? fotoUrl;

    return (
        <main className="min-h-screen bg-mare-creme pb-24 lg:pb-10">
            {/* ===================== DESKTOP ===================== */}
            <div className="mx-auto hidden w-full max-w-7xl px-6 py-5 lg:block">
                <DashboardNavbar
                    sessao="logado"
                    nomeUsuario={nome}
                    totalFavoritos={favoritos.length}
                    paginaAtiva="Perfil"
                />

                <div className="mt-7 grid grid-cols-[410px_minmax(0,1fr)] items-start gap-14">
                    {/* Coluna esquerda */}
                    <aside className="space-y-6">
                        <section className="rounded-[2rem] border border-stone-200 bg-white px-7 py-8 text-center">
                            <button
                                type="button"
                                onClick={abrirEditor}
                                aria-label="Alterar foto e dados do perfil"
                                className="mx-auto block rounded-full transition hover:scale-[1.03]"
                            >
                                <Avatar foto={fotoUrl} nome={nome} tamanho="size-36" />
                            </button>

                            <h1 className="font-titulo mt-5 text-3xl font-bold text-stone-900">
                                {nome}
                            </h1>

                            <p className="mt-1 break-all text-sm text-stone-500">
                                {email}
                            </p>

                            <div className="mt-4 flex justify-center gap-2">
                                <span className="rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
                                    ATIVO
                                </span>
                                <span className="rounded-full bg-violet-600 px-4 py-1 text-xs font-bold text-white">
                                    MARÉ LN
                                </span>
                            </div>

                            <div className="mt-7 flex gap-3">
                                <button
                                    type="button"
                                    onClick={abrirEditor}
                                    className="flex-1 rounded-xl border-2 border-mare-laranja px-3 py-2.5 text-sm font-bold text-mare-laranja transition hover:bg-mare-laranja hover:text-white"
                                >
                                    EDITAR PERFIL
                                </button>

                                <button
                                    type="button"
                                    onClick={sairDaConta}
                                    className="flex-1 rounded-xl bg-red-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
                                >
                                    SAIR
                                </button>
                            </div>
                        </section>

                        {/* Preferências */}
                        <section className="rounded-[2rem] border border-stone-200 bg-white p-7">
                            <h2 className="font-titulo text-2xl font-bold text-stone-900">
                                PREFERÊNCIAS
                            </h2>

                            <div className="mt-5 space-y-5">
                                <div>
                                    <h3 className="mb-2 text-sm font-bold uppercase text-mare-rosa">
                                        CIDADE
                                    </h3>
                                    <p className="rounded-xl border border-mare-rosa px-4 py-3 font-titulo text-lg">
                                        {preferencias.cidade || "Não definida"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-sm font-bold uppercase text-mare-rosa">
                                        INTERESSES
                                    </h3>
                                    <p className="rounded-xl border border-mare-rosa px-4 py-3 font-titulo text-lg">
                                        {textoInteresses()}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={abrirEditor}
                                className="mt-5 text-sm font-bold text-mare-laranja hover:underline"
                            >
                                Editar preferências
                            </button>
                        </section>

                        {/* Ações da conta */}
                        <section className="space-y-3 rounded-[2rem] bg-orange-600 p-6">
                            <BotaoAcao onClick={abrirAvisoSenha}>
                                Alterar senha
                            </BotaoAcao>

                            <Link
                                href="/dashboard#favoritos"
                                className="block w-full rounded-xl bg-mare-creme px-5 py-3 text-center font-titulo text-base font-bold text-stone-900 transition hover:brightness-95"
                            >
                                Meus Favoritos
                            </Link>

                            <BotaoAcao onClick={sairDaConta} variante="vermelho">
                                Sair da conta
                            </BotaoAcao>
                        </section>
                    </aside>

                    {/* Coluna direita */}
                    <div className="min-w-0 space-y-8">
                        {/* Banner de divulgação */}
                        {bannerVisivel && (
                            <section className="flex min-h-36 items-center justify-between gap-6 rounded-[2rem] bg-violet-600 px-8 py-7 text-white shadow-lg shadow-violet-900/20">
                                <div>
                                    <h2 className="font-titulo text-2xl font-bold">
                                        GOSTARIA DE BRILHAR MAIS?
                                    </h2>
                                    <p className="mt-2 max-w-lg font-titulo text-lg leading-snug">
                                        Seja vencedor divulgando seus eventos na nossa plataforma!
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={abrirAvisoDivulgacao}
                                    className="shrink-0 rounded-2xl border-2 border-white bg-orange-600 px-8 py-4 font-titulo text-lg font-bold text-white transition hover:brightness-110"
                                >
                                    BRILHAR
                                </button>
                            </section>
                        )}

                        {/* Histórico */}
                        <section>
                            <h2 className="font-titulo mb-5 text-3xl font-bold text-stone-900">
                                HISTÓRICO DE EVENTOS PARTICIPADOS
                            </h2>

                            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center">
                                <IconeCalendario
                                    size={36}
                                    className="mx-auto text-mare-laranja"
                                />
                                <p className="font-titulo mt-4 text-xl font-bold">
                                    Seu histórico aparecerá aqui
                                </p>
                                <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                                    Quando suas participações em eventos estiverem registradas na
                                    plataforma, você poderá consultar todas por aqui.
                                </p>
                                <Link
                                    href="/explorar"
                                    className="mt-5 inline-block rounded-full bg-mare-laranja px-8 py-3 font-titulo font-bold text-white transition hover:brightness-95"
                                >
                                    Explorar eventos
                                </Link>
                            </div>
                        </section>

                        {/* Eventos marcados: favoritos reais */}
                        <section>
                            <h2 className="font-titulo mb-5 text-3xl font-bold text-stone-900">
                                EVENTOS MARCADOS
                            </h2>

                            {eventosMarcados.length === 0 ? (
                                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                                    <IconeCoracao
                                        size={34}
                                        className="mx-auto text-mare-rosa"
                                    />
                                    <p className="font-titulo mt-3 text-lg font-bold">
                                        Você ainda não marcou eventos
                                    </p>
                                    <Link
                                        href="/explorar"
                                        className="mt-4 inline-block font-bold text-mare-laranja hover:underline"
                                    >
                                        Encontrar eventos
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {eventosMarcados.map((evento) => (
                                        <article
                                            key={evento.id}
                                            className="flex items-center gap-5 rounded-2xl border border-stone-200 bg-white p-4"
                                        >
                                            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                                                <Image
                                                    src={evento.imagem}
                                                    alt={evento.titulo}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-titulo text-lg font-bold leading-tight">
                                                    {evento.titulo}
                                                </h3>

                                                <p className="mt-1 text-xs text-stone-500">
                                                    <IconeCalendario
                                                        size={12}
                                                        className="mr-1 inline"
                                                    />
                                                    {evento.data} • {evento.hora}
                                                </p>

                                                <p className="mt-1 text-xs text-stone-500">
                                                    <IconePino size={12} className="mr-1 inline" />
                                                    {evento.local}, {evento.cidade}
                                                </p>
                                            </div>

                                            <span className="hidden rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 sm:inline">
                                                SALVO
                                            </span>

                                            <button
                                                type="button"
                                                aria-label={`Remover ${evento.titulo} dos favoritos`}
                                                onClick={() => alternarFavorito(evento.id)}
                                                className="grid size-10 shrink-0 place-items-center rounded-full border border-mare-rosa text-mare-rosa transition hover:bg-mare-rosa hover:text-white"
                                            >
                                                <IconeCoracao size={18} ativo />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* ===================== MOBILE ===================== */}
            <div className="lg:hidden">
                {/* Cabeçalho */}
                <header className="relative rounded-br-[5rem] bg-orange-600 px-6 pb-8 pt-6 text-white">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="grid size-9 place-items-center rounded-xl bg-white text-lg font-extrabold text-orange-600">
                                M
                            </span>
                            <span className="font-titulo text-lg font-bold">Maré LN</span>
                        </Link>

                        <button
                            type="button"
                            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                            aria-expanded={menuAberto}
                            onClick={() => setMenuAberto((atual) => !atual)}
                            className="grid size-11 place-items-center rounded-full"
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                aria-hidden="true"
                            >
                                {menuAberto ? (
                                    <path d="M6 6l12 12M18 6 6 18" />
                                ) : (
                                    <path d="M4 7h16M4 12h16M4 17h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {menuAberto && (
                        <nav className="absolute right-5 top-20 z-40 w-52 rounded-2xl bg-white p-2 text-stone-800 shadow-xl">
                            <Link
                                href="/dashboard"
                                className="block rounded-xl px-4 py-3 text-sm hover:bg-stone-50"
                            >
                                Início
                            </Link>
                            <Link
                                href="/explorar"
                                className="block rounded-xl px-4 py-3 text-sm hover:bg-stone-50"
                            >
                                Explorar
                            </Link>
                            <Link
                                href="/dashboard#favoritos-mobile"
                                className="block rounded-xl px-4 py-3 text-sm hover:bg-stone-50"
                            >
                                Favoritos
                            </Link>
                        </nav>
                    )}

                    <div className="mt-10 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={abrirEditor}
                            aria-label="Editar foto e perfil"
                            className="rounded-full"
                        >
                            <Avatar foto={fotoUrl} nome={nome} tamanho="size-32" />
                        </button>

                        <div className="min-w-0">
                            <h1 className="font-titulo text-2xl font-bold uppercase leading-tight">
                                {nome}
                            </h1>

                            <p className="mt-1 break-all text-xs text-white/80">
                                {email}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={abrirEditor}
                                    className="rounded-full bg-mare-creme px-4 py-2 font-titulo text-sm font-bold text-stone-900"
                                >
                                    EDITAR
                                </button>

                                <button
                                    type="button"
                                    onClick={sairDaConta}
                                    className="rounded-full bg-red-700 px-4 py-2 font-titulo text-sm font-bold text-white"
                                >
                                    SAIR
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Banner mobile */}
                {bannerVisivel && (
                    <section className="relative mt-6 flex items-center justify-between gap-3 bg-violet-600 px-5 py-4 text-white">
                        <p className="font-titulo text-base leading-tight">
                            GOSTARIA DE DIVULGAR
                            <br />
                            SEUS EVENTOS?
                        </p>

                        <button
                            type="button"
                            onClick={abrirAvisoDivulgacao}
                            className="shrink-0 rounded-full bg-mare-creme px-6 py-3 font-titulo font-bold text-stone-900"
                        >
                            DIVULGAR
                        </button>

                        <button
                            type="button"
                            aria-label="Fechar banner"
                            onClick={() => setBannerVisivel(false)}
                            className="absolute right-1 top-0 text-xs font-bold"
                        >
                            ×
                        </button>
                    </section>
                )}

                <div className="space-y-10 px-5 pb-8 pt-7">
                    {/* Preferências */}
                    <section>
                        <h2 className="font-titulo mb-5 text-2xl font-bold">
                            PREFERÊNCIAS
                        </h2>

                        <div className="space-y-5">
                            <div className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-mare-rosa px-4 py-3">
                                <span className="font-titulo text-lg font-bold text-mare-rosa">
                                    CIDADE
                                </span>
                                <span className="text-right font-titulo text-lg">
                                    {preferencias.cidade || "Não definida"}
                                </span>
                            </div>

                            <div className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-mare-rosa px-4 py-3">
                                <span className="font-titulo text-lg font-bold text-mare-rosa">
                                    INTERESSES
                                </span>
                                <span className="max-w-[55%] truncate text-right font-titulo text-lg">
                                    {textoInteresses()}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={abrirEditor}
                            className="mt-4 text-sm font-bold text-mare-laranja"
                        >
                            Editar preferências
                        </button>
                    </section>

                    {/* Histórico */}
                    <section>
                        <h2 className="font-titulo mb-5 text-2xl font-bold">
                            HISTÓRICO
                        </h2>

                        <div className="rounded-2xl bg-white px-5 py-8 text-center shadow-sm">
                            <IconeCalendario
                                size={32}
                                className="mx-auto text-mare-laranja"
                            />
                            <p className="font-titulo mt-3 text-lg font-bold">
                                Ainda não há participações
                            </p>
                            <p className="mt-2 text-sm text-stone-500">
                                Seus eventos participados aparecerão aqui quando forem
                                registrados na plataforma.
                            </p>
                            <Link
                                href="/explorar"
                                className="mt-4 inline-block rounded-full bg-mare-laranja px-7 py-2.5 font-titulo font-bold text-white"
                            >
                                VER EVENTOS
                            </Link>
                        </div>
                    </section>

                    {/* Eventos marcados */}
                    <section>
                        <h2 className="font-titulo mb-5 text-2xl font-bold">
                            EVENTOS MARCADOS
                        </h2>

                        {eventosMarcados.length === 0 ? (
                            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                                <p className="font-titulo font-bold">
                                    Nenhum evento salvo ainda.
                                </p>
                                <Link
                                    href="/explorar"
                                    className="mt-3 inline-block font-bold text-mare-laranja"
                                >
                                    Explorar eventos
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {eventosMarcados.map((evento) => (
                                    <article
                                        key={evento.id}
                                        className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                                    >
                                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                                            <Image
                                                src={evento.imagem}
                                                alt={evento.titulo}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-titulo text-base font-bold leading-tight">
                                                {evento.titulo}
                                            </h3>
                                            <p className="mt-1 text-xs text-stone-500">
                                                {evento.data} • {evento.hora}
                                            </p>
                                            <p className="mt-1 text-xs text-stone-500">
                                                {evento.local}, {evento.cidade}
                                            </p>
                                            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">
                                                SALVO
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            aria-label={`Remover ${evento.titulo} dos favoritos`}
                                            onClick={() => alternarFavorito(evento.id)}
                                            className="grid size-11 shrink-0 place-items-center rounded-full border border-mare-rosa text-mare-rosa"
                                        >
                                            <IconeCoracao size={22} ativo />
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Ações da conta */}
                <section className="space-y-4 bg-orange-600 px-6 py-8">
                    <BotaoAcao onClick={abrirAvisoSenha}>
                        Alterar senha
                    </BotaoAcao>

                    <Link
                        href="/dashboard#favoritos-mobile"
                        className="block w-full rounded-xl bg-mare-creme px-5 py-3 text-center font-titulo text-base font-bold text-stone-900"
                    >
                        Favoritos
                    </Link>

                    <BotaoAcao onClick={sairDaConta} variante="vermelho">
                        Sair da conta
                    </BotaoAcao>
                </section>

                {/* Navegação inferior */}
                <nav
                    aria-label="Navegação principal"
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
                >
                    <ul className="mx-auto flex max-w-xl items-stretch justify-around">
                        {[
                            { href: "/dashboard", label: "Início", Icone: IconeInicio },
                            { href: "/explorar", label: "Explorar", Icone: IconeBusca },
                            { href: "/explorar", label: "Mapa", Icone: IconeSeta },
                            {
                                href: "/dashboard#favoritos-mobile",
                                label: "Favoritos",
                                Icone: IconeCoracao,
                            },
                            { href: "/perfil", label: "Perfil", Icone: IconeUsuario },
                        ].map(({ href, label, Icone }) => (
                            <li key={label} className="flex-1">
                                <Link
                                    href={href}
                                    aria-current={label === "Perfil" ? "page" : undefined}
                                    className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${label === "Perfil"
                                            ? "font-bold text-mare-laranja"
                                            : "text-stone-400"
                                        }`}
                                >
                                    <Icone size={22} />
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Modal de edição do perfil */}
            {editorAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-editar-perfil"
                        className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h2
                                id="titulo-editar-perfil"
                                className="font-titulo text-2xl font-bold"
                            >
                                Editar perfil
                            </h2>

                            <button
                                type="button"
                                onClick={fecharEditor}
                                aria-label="Fechar edição"
                                className="grid size-9 place-items-center rounded-full bg-stone-100 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarPerfil} className="mt-5 space-y-5">
                            {/* Foto */}
                            <div className="flex flex-col items-center gap-3">
                                <Avatar
                                    foto={fotoNoEditor}
                                    nome={nome}
                                    tamanho="size-28"
                                />

                                <label className="cursor-pointer rounded-full border border-mare-laranja px-5 py-2 text-sm font-bold text-mare-laranja hover:bg-mare-laranja hover:text-white">
                                    Escolher foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={selecionarFoto}
                                        className="sr-only"
                                    />
                                </label>

                                {(fotoUrl || fotoPreview) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFotoPreview(null);
                                            setArquivoFoto(null);
                                            setRemoverFoto(true);
                                        }}
                                        className="text-xs font-semibold text-red-600 hover:underline"
                                    >
                                        Remover foto
                                    </button>
                                )}

                                <p className="text-center text-xs text-stone-400">
                                    Imagens JPG, PNG ou WEBP. Tamanho máximo: 5 MB.
                                </p>
                            </div>

                            {/* Nome */}
                            <div>
                                <label
                                    htmlFor="perfil-nome"
                                    className="mb-2 block text-sm font-bold text-stone-700"
                                >
                                    Nome
                                </label>
                                <input
                                    id="perfil-nome"
                                    type="text"
                                    value={nomeRascunho}
                                    onChange={(event) => setNomeRascunho(event.target.value)}
                                    maxLength={60}
                                    required
                                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-mare-laranja"
                                />
                            </div>

                            {/* Cidade */}
                            <div>
                                <label
                                    htmlFor="perfil-cidade"
                                    className="mb-2 block text-sm font-bold text-stone-700"
                                >
                                    Cidade
                                </label>
                                <select
                                    id="perfil-cidade"
                                    value={cidadeRascunho}
                                    onChange={(event) =>
                                        setCidadeRascunho(event.target.value as Cidade | "")
                                    }
                                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-mare-laranja"
                                >
                                    <option value="">Selecione sua cidade</option>
                                    {cidades.map((cidade) => (
                                        <option key={cidade} value={cidade}>
                                            {cidade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Interesses */}
                            <fieldset>
                                <legend className="mb-3 text-sm font-bold text-stone-700">
                                    Interesses
                                </legend>

                                <div className="grid grid-cols-2 gap-2">
                                    {categorias.map((categoria) => (
                                        <label
                                            key={categoria}
                                            className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={interessesRascunho.includes(categoria)}
                                                onChange={() => alternarInteresse(categoria)}
                                                className="accent-mare-laranja"
                                            />
                                            {nomesCategorias[categoria]}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            {erro && (
                                <p role="alert" className="text-sm font-semibold text-red-600">
                                    {erro}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={fecharEditor}
                                    disabled={salvando}
                                    className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-stone-600"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="flex-1 rounded-xl bg-mare-laranja px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                                >
                                    {salvando ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Avisos de recursos ainda não integrados */}
            {aviso && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-aviso-perfil"
                        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <h2
                            id="titulo-aviso-perfil"
                            className="font-titulo text-xl font-bold"
                        >
                            Maré LN
                        </h2>

                        <p className="mt-3 text-sm leading-relaxed text-stone-600">
                            {aviso}
                        </p>

                        <button
                            type="button"
                            onClick={() => setAviso(null)}
                            className="mt-6 w-full rounded-xl bg-mare-laranja px-5 py-3 font-bold text-white"
                        >
                            Entendi
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}
