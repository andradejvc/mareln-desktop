
"use client";

import Link from "next/link";
import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";

import {
    cidades,
    type Cidade,
} from "@/data/eventos";

import {
    criarEvento,
    enviarImagemEvento,
    listarCategorias,
    type CategoriaBackend,
} from "@/lib/eventos-api";

import {
    buscarLocalizacoes,
    type ResultadoGeocodificacao,
} from "@/lib/geocoding-api";

import SelecionarLocalizacaoLeaflet, {
    type CoordenadaSelecionada,
} from "@/components/mapa/SelecionarLocalizacaoLeaflet";

import { useUsuario } from "@/lib/usuario";

type LocalizacaoSelecionada = {
    nome: string;
    cidade: Cidade;
    latitude: number;
    longitude: number;
    precisaoLocalizacao: "EXATA" | "APROXIMADA";
    origem: "BUSCA" | "MANUAL";
};

const TIPOS_IMAGEM_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;

export default function DivulgarEventoView() {
    const usuario = useUsuario();

    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [data, setData] = useState("");
    const [local, setLocal] = useState("");
    const [cidade, setCidade] = useState<Cidade | "">("");
    const [categoriaId, setCategoriaId] = useState("");

    // Foto do evento
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [erroImagem, setErroImagem] = useState<string | null>(null);

    const imagemInputRef = useRef<HTMLInputElement | null>(null);

    const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);
    const [carregandoCategorias, setCarregandoCategorias] = useState(true);
    const [erroCategorias, setErroCategorias] = useState<string | null>(null);

    const [resultadosLocalizacao, setResultadosLocalizacao] = useState<
        ResultadoGeocodificacao[]
    >([]);

    const [localizacaoSelecionada, setLocalizacaoSelecionada] =
        useState<LocalizacaoSelecionada | null>(null);

    const [mostrarMapaManual, setMostrarMapaManual] = useState(false);

    const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
    const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    const podeDivulgar =
        usuario?.tipo === "DIVULGADOR" ||
        usuario?.tipo === "ADMIN";

    // Carrega as categorias disponíveis.
    useEffect(() => {
        let ativo = true;

        async function carregarCategorias() {
            try {
                const resposta = await listarCategorias();

                if (ativo) {
                    setCategorias(resposta);
                }
            } catch (erro) {
                if (ativo) {
                    setErroCategorias(
                        erro instanceof Error
                            ? erro.message
                            : "Não foi possível carregar as categorias.",
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoCategorias(false);
                }
            }
        }

        void carregarCategorias();

        return () => {
            ativo = false;
        };
    }, []);

    // Cria e libera a URL temporária utilizada na pré-visualização.
    useEffect(() => {
        if (!imagemArquivo) {
            setImagemPreview(null);
            return;
        }

        const url = URL.createObjectURL(imagemArquivo);

        setImagemPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [imagemArquivo]);

    function selecionarImagem(arquivo: File | null) {
        setErroImagem(null);

        if (!arquivo) {
            setImagemArquivo(null);
            return;
        }

        if (!TIPOS_IMAGEM_PERMITIDOS.includes(arquivo.type)) {
            setImagemArquivo(null);
            setErroImagem(
                "Formato inválido. Escolha uma imagem JPEG, PNG ou WebP.",
            );
            return;
        }

        if (arquivo.size === 0) {
            setImagemArquivo(null);
            setErroImagem("O arquivo selecionado está vazio.");
            return;
        }

        if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
            setImagemArquivo(null);
            setErroImagem("A imagem deve ter no máximo 5 MB.");
            return;
        }

        setImagemArquivo(arquivo);
        setErro(null);
    }

    function removerImagem() {
        setImagemArquivo(null);
        setErroImagem(null);

        if (imagemInputRef.current) {
            imagemInputRef.current.value = "";
        }
    }

    function limparLocalizacao() {
        setLocalizacaoSelecionada(null);
        setResultadosLocalizacao([]);
        setErroLocalizacao(null);
        setErro(null);
        setMostrarMapaManual(false);
    }

    function alterarLocal(valor: string) {
        setLocal(valor);
        limparLocalizacao();
    }

    function alterarCidade(valor: Cidade | "") {
        setCidade(valor);
        limparLocalizacao();
    }

    async function pesquisarLocalizacao() {
        setErroLocalizacao(null);
        setLocalizacaoSelecionada(null);
        setResultadosLocalizacao([]);

        if (!local.trim() || local.trim().length < 3) {
            setErroLocalizacao(
                "Informe um nome de local ou endereço mais completo.",
            );
            return;
        }

        if (!cidade) {
            setErroLocalizacao(
                "Selecione a cidade antes de buscar o endereço.",
            );
            return;
        }

        setBuscandoLocalizacao(true);

        try {
            const resultados = await buscarLocalizacoes(local, cidade);

            setResultadosLocalizacao(resultados);

            if (resultados.length === 0) {
                setErroLocalizacao(
                    "Nenhum endereço correspondente foi encontrado. Você pode selecionar o local diretamente no mapa.",
                );
            }
        } catch (erro) {
            setErroLocalizacao(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível buscar a localização.",
            );
        } finally {
            setBuscandoLocalizacao(false);
        }
    }

    function selecionarLocalizacao(
        resultado: ResultadoGeocodificacao,
    ) {
        setLocalizacaoSelecionada({
            nome: resultado.nome,
            cidade: resultado.cidade,
            latitude: resultado.latitude,
            longitude: resultado.longitude,
            precisaoLocalizacao: resultado.precisaoLocalizacao,
            origem: "BUSCA",
        });

        setMostrarMapaManual(false);
        setErroLocalizacao(null);
        setErro(null);
    }

    function selecionarCoordenadaManual(
        coordenadas: CoordenadaSelecionada,
    ) {
        if (!cidade) {
            setErroLocalizacao("Selecione uma cidade primeiro.");
            return;
        }

        setLocalizacaoSelecionada({
            nome: local.trim(),
            cidade,
            latitude: coordenadas.latitude,
            longitude: coordenadas.longitude,
            precisaoLocalizacao: "APROXIMADA",
            origem: "MANUAL",
        });

        setErroLocalizacao(null);
        setErro(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (salvando) return;

        if (!podeDivulgar) {
            setErro(
                "Somente divulgadores ou administradores podem cadastrar eventos.",
            );
            return;
        }

        setErro(null);

        if (!localizacaoSelecionada) {
            setErro(
                "Pesquise e selecione uma localização ou marque o ponto diretamente no mapa.",
            );
            return;
        }

        if (
            !cidade ||
            localizacaoSelecionada.cidade !== cidade
        ) {
            setErro(
                "A localização selecionada não corresponde à cidade informada.",
            );
            return;
        }

        if (
            !Number.isFinite(localizacaoSelecionada.latitude) ||
            !Number.isFinite(localizacaoSelecionada.longitude)
        ) {
            setErro("As coordenadas selecionadas são inválidas.");
            return;
        }

        const dataConvertida = new Date(data);

        if (Number.isNaN(dataConvertida.getTime())) {
            setErro("Informe uma data e horário válidos.");
            return;
        }

        setSalvando(true);

        try {
            let imagemUrl: string | undefined;

            // 1. Envia a imagem ao backend, caso tenha sido selecionada.
            if (imagemArquivo) {
                const resultadoUpload =
                    await enviarImagemEvento(imagemArquivo);

                imagemUrl = resultadoUpload.imagemUrl;
            }

            // 2. Cadastra o evento com o endereço da imagem.
            await criarEvento({
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                data: dataConvertida.toISOString(),
                local: local.trim(),
                cidade: localizacaoSelecionada.cidade,
                latitude: localizacaoSelecionada.latitude,
                longitude: localizacaoSelecionada.longitude,
                precisaoLocalizacao:
                    localizacaoSelecionada.precisaoLocalizacao,

                ...(imagemUrl ? { imagemUrl } : {}),

                ...(categoriaId
                    ? { categoriaId: Number(categoriaId) }
                    : {}),
            });

            setSucesso(true);
        } catch (erro) {
            setErro(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível cadastrar o evento.",
            );
        } finally {
            setSalvando(false);
        }
    }

    if (!podeDivulgar) {
        return (
            <main className="min-h-screen bg-mare-creme px-5 py-12">
                <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="font-titulo text-2xl font-bold text-stone-800">
                        Acesso não permitido
                    </h1>

                    <p className="mt-3 text-sm text-stone-600">
                        Somente usuários com perfil de divulgador ou
                        administrador podem cadastrar eventos.
                    </p>

                    <Link
                        href="/perfil"
                        className="mt-6 inline-flex rounded-xl bg-mare-laranja px-6 py-3 font-bold text-white"
                    >
                        Voltar ao perfil
                    </Link>
                </section>
            </main>
        );
    }

    if (sucesso) {
        return (
            <main className="min-h-screen bg-mare-creme px-5 py-12">
                <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m5 12 4 4L19 6" />
                        </svg>
                    </div>

                    <h1 className="font-titulo mt-5 text-2xl font-bold text-stone-800">
                        Evento enviado com sucesso!
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        Seu evento foi cadastrado e está aguardando aprovação
                        de um administrador.
                    </p>

                    <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        Status: Pendente de aprovação
                    </p>

                    <Link
                        href="/meus-eventos"
                        className="mt-6 inline-flex rounded-xl bg-mare-laranja px-6 py-3 font-bold text-white transition hover:opacity-90"
                    >
                        Ver meus eventos
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-mare-creme px-5 py-10">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/perfil"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-mare-laranja hover:underline"
                >
                    <span aria-hidden="true">←</span>
                    Voltar ao perfil
                </Link>

                <section className="mt-6 rounded-3xl bg-white p-5 shadow-md sm:p-8">
                    <header className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-mare-rosa">
                            Área do divulgador
                        </p>

                        <h1 className="font-titulo mt-2 text-3xl font-bold text-stone-900">
                            Divulgar evento
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-stone-600">
                            Preencha as informações para cadastrar seu evento
                            no Maré LN. Depois do envio, ele passará pela
                            análise de um administrador.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Título */}
                        <div>
                            <label
                                htmlFor="titulo-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Nome do evento
                            </label>

                            <input
                                id="titulo-evento"
                                type="text"
                                required
                                maxLength={150}
                                value={titulo}
                                onChange={(event) =>
                                    setTitulo(event.target.value)
                                }
                                placeholder="Ex.: Festival de Música Caiçara"
                                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label
                                htmlFor="descricao-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Descrição
                            </label>

                            <textarea
                                id="descricao-evento"
                                required
                                rows={5}
                                value={descricao}
                                onChange={(event) =>
                                    setDescricao(event.target.value)
                                }
                                placeholder="Descreva a programação e as informações importantes do evento."
                                className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                            />
                        </div>

                        {/* Foto do evento */}
                        <div>
                            <label
                                htmlFor="imagem-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Foto de capa do evento
                                <span className="ml-2 text-xs font-normal text-stone-500">
                                    (Opcional)
                                </span>
                            </label>

                            <p className="mb-3 text-xs text-stone-500">
                                Escolha uma imagem para representar seu
                                evento. Formatos aceitos: JPEG, PNG e WebP.
                                Tamanho máximo: 5 MB.
                            </p>

                            <input
                                ref={imagemInputRef}
                                id="imagem-evento"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => {
                                    selecionarImagem(
                                        event.currentTarget.files?.[0] ?? null,
                                    );

                                    if (erroImagem) {
                                        setErroImagem(null);
                                    }
                                }}
                                className="block w-full rounded-xl border border-stone-300 bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-mare-laranja"
                            />

                            {erroImagem && (
                                <p
                                    role="alert"
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {erroImagem}
                                </p>
                            )}

                            {imagemPreview && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200">
                                    <div className="aspect-video bg-stone-100">
                                        <img
                                            src={imagemPreview}
                                            alt="Pré-visualização da foto do evento"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-stone-800">
                                                {imagemArquivo?.name}
                                            </p>

                                            <p className="text-xs text-stone-500">
                                                {imagemArquivo
                                                    ? `${(imagemArquivo.size / (1024 * 1024)).toFixed(2)} MB`
                                                    : ""}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={removerImagem}
                                            className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                        >
                                            Remover foto
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Data */}
                        <div>
                            <label
                                htmlFor="data-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Data e horário
                            </label>

                            <input
                                id="data-evento"
                                type="datetime-local"
                                required
                                value={data}
                                onChange={(event) =>
                                    setData(event.target.value)
                                }
                                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                            />
                        </div>

                        {/* Cidade */}
                        <div>
                            <label
                                htmlFor="cidade-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Cidade do evento
                            </label>

                            <select
                                id="cidade-evento"
                                required
                                value={cidade}
                                onChange={(event) =>
                                    alterarCidade(
                                        event.target.value as Cidade | "",
                                    )
                                }
                                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                            >
                                <option value="">
                                    Selecione a cidade
                                </option>

                                {cidades.map((nome) => (
                                    <option key={nome} value={nome}>
                                        {nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Local */}
                        <div>
                            <label
                                htmlFor="local-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Nome do local ou endereço
                            </label>

                            <input
                                id="local-evento"
                                type="text"
                                required
                                minLength={3}
                                maxLength={200}
                                value={local}
                                onChange={(event) =>
                                    alterarLocal(event.target.value)
                                }
                                placeholder="Ex.: Praça Cândido Mota"
                                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                            />

                            <p className="mt-1 text-xs text-stone-500">
                                Informe o nome do espaço, estabelecimento ou
                                endereço onde acontecerá o evento.
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        void pesquisarLocalizacao()
                                    }
                                    disabled={
                                        buscandoLocalizacao ||
                                        local.trim().length < 3 ||
                                        !cidade
                                    }
                                    className="rounded-xl border-2 border-mare-laranja px-4 py-3 text-sm font-bold text-mare-laranja transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {buscandoLocalizacao
                                        ? "Buscando..."
                                        : "Buscar endereço"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!cidade) {
                                            setErroLocalizacao(
                                                "Selecione a cidade antes de abrir o mapa.",
                                            );
                                            return;
                                        }

                                        setLocalizacaoSelecionada(null);
                                        setResultadosLocalizacao([]);
                                        setErroLocalizacao(null);
                                        setErro(null);
                                        setMostrarMapaManual(true);
                                    }}
                                    disabled={!cidade}
                                    className="rounded-xl border-2 border-violet-600 px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Marcar no mapa
                                </button>
                            </div>
                        </div>

                        {/* Resultados da busca */}
                        {resultadosLocalizacao.length > 0 && (
                            <section
                                aria-label="Resultados de localização"
                                className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4"
                            >
                                <h2 className="text-sm font-bold text-stone-800">
                                    Selecione o endereço correto
                                </h2>

                                {resultadosLocalizacao.map((resultado) => {
                                    const selecionado =
                                        localizacaoSelecionada?.origem ===
                                            "BUSCA" &&
                                        localizacaoSelecionada.nome ===
                                            resultado.nome;

                                    return (
                                        <button
                                            key={resultado.id}
                                            type="button"
                                            aria-pressed={selecionado}
                                            onClick={() =>
                                                selecionarLocalizacao(resultado)
                                            }
                                            className={`w-full rounded-xl border p-4 text-left transition ${
                                                selecionado
                                                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                                                    : "border-stone-200 bg-white hover:border-mare-laranja"
                                            }`}
                                        >
                                            <span className="block text-sm font-semibold text-stone-800">
                                                {resultado.nome}
                                            </span>

                                            <span className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-stone-500">
                                                    {resultado.cidade}
                                                </span>

                                                <span
                                                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                                                        resultado.precisaoLocalizacao ===
                                                        "EXATA"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-amber-100 text-amber-800"
                                                    }`}
                                                >
                                                    {resultado.precisaoLocalizacao ===
                                                    "EXATA"
                                                        ? "Ponto de interesse"
                                                        : "Localização aproximada"}
                                                </span>

                                                {selecionado && (
                                                    <span className="text-xs font-bold text-emerald-700">
                                                        Selecionado
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </section>
                        )}

                        {/* Seletor manual com Leaflet */}
                        {mostrarMapaManual && cidade && (
                            <section className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-stone-800">
                                            Selecionar localização
                                        </h2>

                                        <p className="mt-1 text-xs text-stone-600">
                                            Cidade: {cidade}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMostrarMapaManual(false)
                                        }
                                        className="text-xs font-semibold text-stone-500 hover:underline"
                                    >
                                        Fechar mapa
                                    </button>
                                </div>

                                <SelecionarLocalizacaoLeaflet
                                    key={cidade}
                                    cidade={cidade}
                                    onSelecionar={selecionarCoordenadaManual}
                                />
                            </section>
                        )}

                        {/* Localização selecionada */}
                        {localizacaoSelecionada && (
                            <div
                                role="status"
                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                            >
                                <p className="text-sm font-bold text-emerald-800">
                                    Localização selecionada
                                </p>

                                <p className="mt-1 text-xs text-emerald-700">
                                    {localizacaoSelecionada.nome}
                                </p>

                                <p className="mt-1 text-xs text-emerald-700">
                                    {localizacaoSelecionada.cidade}
                                </p>

                                <p className="mt-2 text-xs text-emerald-700">
                                    Latitude:{" "}
                                    {localizacaoSelecionada.latitude.toFixed(6)}
                                </p>

                                <p className="text-xs text-emerald-700">
                                    Longitude:{" "}
                                    {localizacaoSelecionada.longitude.toFixed(6)}
                                </p>

                                <span
                                    className={`mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold ${
                                        localizacaoSelecionada.precisaoLocalizacao ===
                                        "EXATA"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-amber-100 text-amber-800"
                                    }`}
                                >
                                    {localizacaoSelecionada.precisaoLocalizacao ===
                                    "EXATA"
                                        ? "PONTO DE INTERESSE"
                                        : "LOCALIZAÇÃO APROXIMADA"}
                                </span>

                                {localizacaoSelecionada.origem ===
                                    "MANUAL" && (
                                    <p className="mt-2 text-xs text-amber-800">
                                        Confirme visualmente se o marcador
                                        corresponde ao local informado.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={limparLocalizacao}
                                    className="mt-3 block text-xs font-bold text-red-600 hover:underline"
                                >
                                    Remover localização selecionada
                                </button>
                            </div>
                        )}

                        {erroLocalizacao && (
                            <p
                                role="alert"
                                className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
                            >
                                {erroLocalizacao}
                            </p>
                        )}

                        {/* Categoria */}
                        <div>
                            <label
                                htmlFor="categoria-evento"
                                className="mb-2 block text-sm font-bold text-stone-800"
                            >
                                Categoria
                            </label>

                            <select
                                id="categoria-evento"
                                value={categoriaId}
                                onChange={(event) =>
                                    setCategoriaId(event.target.value)
                                }
                                disabled={
                                    carregandoCategorias ||
                                    categorias.length === 0
                                }
                                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20 disabled:bg-stone-100"
                            >
                                <option value="">
                                    {carregandoCategorias
                                        ? "Carregando categorias..."
                                        : categorias.length === 0
                                          ? "Nenhuma categoria disponível"
                                          : "Sem categoria"}
                                </option>

                                {categorias.map((categoria) => (
                                    <option
                                        key={categoria.id}
                                        value={String(categoria.id)}
                                    >
                                        {categoria.nome}
                                    </option>
                                ))}
                            </select>

                            {erroCategorias && (
                                <p className="mt-2 text-xs text-amber-700">
                                    Não foi possível carregar as categorias.
                                    Você ainda pode cadastrar o evento sem
                                    categoria.
                                </p>
                            )}
                        </div>

                        {/* Erro geral */}
                        {erro && (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {erro}
                            </p>
                        )}

                        {/* Cadastro */}
                        <button
                            type="submit"
                            disabled={salvando || buscandoLocalizacao}
                            className="w-full rounded-xl bg-mare-laranja px-5 py-3.5 font-titulo text-lg font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {salvando
                                ? imagemArquivo
                                    ? "Enviando foto e evento..."
                                    : "Enviando evento..."
                                : "Cadastrar evento"}
                        </button>

                        <p className="text-center text-xs leading-relaxed text-stone-500">
                            O envio não publica o evento automaticamente.
                            A publicação depende da aprovação de um
                            administrador.
                        </p>
                    </form>
                </section>
            </div>
        </main>
    );
}
