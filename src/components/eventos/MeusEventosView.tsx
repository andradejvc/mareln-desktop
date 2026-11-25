
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import {
    cidades,
    type Cidade,
} from "@/data/eventos";

import {
    atualizarEvento,
    excluirEvento,
    enviarImagemEvento,
    listarCategorias,
    listarMeusEventos,
    type AtualizarEvento,
    type CategoriaBackend,
    type EventoExplorar,
} from "@/lib/eventos-api";

import {
    buscarLocalizacoes,
    type ResultadoGeocodificacao,
} from "@/lib/geocoding-api";

import SelecionarLocalizacaoLeaflet, {
    type CoordenadaSelecionada,
} from "@/components/mapa/SelecionarLocalizacaoLeaflet";

import { useSessao } from "@/lib/usuario";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

type LocalizacaoEdicao = {
    nome: string;
    cidade: Cidade;
    latitude: number;
    longitude: number;
    precisaoLocalizacao: "EXATA" | "APROXIMADA";
};

const statusEvento = {
    PENDENTE: {
        titulo: "Aguardando aprovação",
        classe: "bg-amber-100 text-amber-800",
    },
    APROVADO: {
        titulo: "Aprovado",
        classe: "bg-emerald-100 text-emerald-800",
    },
    REJEITADO: {
        titulo: "Rejeitado",
        classe: "bg-red-100 text-red-800",
    },
};

const tiposImagemPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const tamanhoMaximoImagem = 5 * 1024 * 1024;

export default function MeusEventosView() {
    const { usuario } = useSessao();

    const [eventos, setEventos] = useState<EventoExplorar[]>([]);
    const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [carregandoCategorias, setCarregandoCategorias] = useState(true);

    const [erro, setErro] = useState<string | null>(null);
    const [erroAcao, setErroAcao] = useState<string | null>(null);
    const [mensagem, setMensagem] = useState<string | null>(null);

    const [tentativa, setTentativa] = useState(0);

    const [eventoEditandoId, setEventoEditandoId] =
        useState<number | null>(null);

    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState<number | null>(null);

    // Dados do formulário de edição.
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [data, setData] = useState("");
    const [local, setLocal] = useState("");
    const [cidade, setCidade] = useState<Cidade | "">("");
    const [categoriaNome, setCategoriaNome] = useState("");

    // Localização.
    const [localizacaoSelecionada, setLocalizacaoSelecionada] =
        useState<LocalizacaoEdicao | null>(null);

    const [resultadosLocalizacao, setResultadosLocalizacao] =
        useState<ResultadoGeocodificacao[]>([]);

    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
    const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(
        null,
    );

    // Foto.
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [imagemRemovida, setImagemRemovida] = useState(false);
    const [erroImagem, setErroImagem] = useState<string | null>(null);

    useEffect(() => {
        let ativo = true;

        async function carregarEventos() {
            setCarregando(true);
            setErro(null);

            try {
                const resposta = await listarMeusEventos();

                if (ativo) {
                    setEventos(resposta);
                }
            } catch (erro) {
                if (ativo) {
                    setErro(
                        erro instanceof Error
                            ? erro.message
                            : "Não foi possível carregar seus eventos.",
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        void carregarEventos();

        return () => {
            ativo = false;
        };
    }, [tentativa]);

    useEffect(() => {
        let ativo = true;

        async function carregarCategorias() {
            try {
                const resposta = await listarCategorias();

                if (ativo) {
                    setCategorias(resposta);
                }
            } catch {
                if (ativo) {
                    setErroAcao(
                        "Não foi possível carregar as categorias.",
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

    // Pré-visualização temporária da nova fotografia.
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

    const pendentes = eventos.filter(
        (evento) => evento.status === "PENDENTE",
    ).length;

    const aprovados = eventos.filter(
        (evento) => evento.status === "APROVADO",
    ).length;

    const rejeitados = eventos.filter(
        (evento) => evento.status === "REJEITADO",
    ).length;

    function formatarDataParaInput(valor: string) {
        const dataEvento = new Date(valor);

        if (Number.isNaN(dataEvento.getTime())) {
            return "";
        }

        const partes = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }).formatToParts(dataEvento);

        const obter = (tipo: string) =>
            partes.find((parte) => parte.type === tipo)?.value ?? "";

        return `${obter("year")}-${obter("month")}-${obter("day")}T${obter("hour")}:${obter("minute")}`;
    }

    function abrirEdicao(evento: EventoExplorar) {
        if (carregandoCategorias) {
            setErroAcao("Aguarde o carregamento das categorias.");
            return;
        }

        setErroAcao(null);
        setMensagem(null);
        setErroLocalizacao(null);
        setErroImagem(null);

        setTitulo(evento.titulo);
        setDescricao(evento.descricao);
        setData(formatarDataParaInput(evento.dataISO));
        setLocal(evento.local);
        setCidade(evento.cidade ?? "");
        setCategoriaNome(
            evento.categoria === "Sem categoria"
                ? ""
                : evento.categoria,
        );

        if (
            evento.cidade &&
            evento.latitude !== null &&
            evento.longitude !== null &&
            evento.precisaoLocalizacao
        ) {
            setLocalizacaoSelecionada({
                nome: evento.local,
                cidade: evento.cidade,
                latitude: evento.latitude,
                longitude: evento.longitude,
                precisaoLocalizacao: evento.precisaoLocalizacao,
            });
        } else {
            setLocalizacaoSelecionada(null);
        }

        setResultadosLocalizacao([]);
        setMostrarMapa(false);

        setImagemArquivo(null);
        setImagemRemovida(false);

        setEventoEditandoId(evento.id);

        document
            .getElementById(`editar-evento-${evento.id}`)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    }

    function cancelarEdicao() {
        setEventoEditandoId(null);
        setErroAcao(null);
        setErroLocalizacao(null);
        setErroImagem(null);

        setImagemArquivo(null);
        setImagemPreview(null);
        setImagemRemovida(false);

        setLocalizacaoSelecionada(null);
        setResultadosLocalizacao([]);
        setMostrarMapa(false);
    }

    function alterarLocal(valor: string) {
        setLocal(valor);
        setLocalizacaoSelecionada(null);
        setResultadosLocalizacao([]);
        setErroLocalizacao(null);
    }

    function alterarCidade(valor: Cidade | "") {
        setCidade(valor);
        setLocalizacaoSelecionada(null);
        setResultadosLocalizacao([]);
        setErroLocalizacao(null);
    }

    async function pesquisarLocalizacao() {
        setErroLocalizacao(null);
        setResultadosLocalizacao([]);
        setLocalizacaoSelecionada(null);

        if (!cidade) {
            setErroLocalizacao("Selecione uma cidade primeiro.");
            return;
        }

        if (local.trim().length < 3) {
            setErroLocalizacao(
                "Informe um nome de local ou endereço mais completo.",
            );
            return;
        }

        setBuscandoLocalizacao(true);

        try {
            const resultados = await buscarLocalizacoes(local, cidade);

            setResultadosLocalizacao(resultados);

            if (resultados.length === 0) {
                setErroLocalizacao(
                    "Nenhum endereço correspondente foi encontrado. Você pode marcar o local diretamente no mapa.",
                );
            }
        } catch (erro) {
            setErroLocalizacao(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível buscar o endereço.",
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
        });

        setMostrarMapa(false);
        setErroLocalizacao(null);
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
        });

        setErroLocalizacao(null);
    }

    function selecionarImagem(arquivo: File | null) {
        setErroImagem(null);

        if (!arquivo) {
            setImagemArquivo(null);
            return;
        }

        if (!tiposImagemPermitidos.includes(arquivo.type)) {
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

        if (arquivo.size > tamanhoMaximoImagem) {
            setImagemArquivo(null);
            setErroImagem("A imagem deve ter no máximo 5 MB.");
            return;
        }

        setImagemArquivo(arquivo);
        setImagemRemovida(false);
    }

    async function salvarEdicao(
        eventoOriginal: EventoExplorar,
        eventoFormulario: FormEvent<HTMLFormElement>,
    ) {
        eventoFormulario.preventDefault();

        if (salvando) return;

        setErroAcao(null);
        setMensagem(null);

        if (!titulo.trim() || !descricao.trim() || !local.trim()) {
            setErroAcao(
                "Preencha o título, a descrição e o endereço do evento.",
            );
            return;
        }

        if (!data) {
            setErroAcao("Informe a data e o horário do evento.");
            return;
        }

        if (
            localizacaoSelecionada &&
            cidade !== localizacaoSelecionada.cidade
        ) {
            setErroAcao(
                "A localização selecionada não corresponde à cidade informada.",
            );
            return;
        }

        const dataConvertida = new Date(data);

        if (Number.isNaN(dataConvertida.getTime())) {
            setErroAcao("Informe uma data e horário válidos.");
            return;
        }

        const categoria = categoriaNome
            ? categorias.find(
                  (item) => item.nome === categoriaNome,
              )
            : null;

        if (categoriaNome && !categoria) {
            setErroAcao("Selecione uma categoria válida.");
            return;
        }

        const dados: AtualizarEvento = {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            data: dataConvertida.toISOString(),
            local: local.trim(),
            categoriaId: categoria?.id ?? null,
        };

        if (cidade) {
            dados.cidade = cidade;
        }

        if (localizacaoSelecionada) {
            dados.cidade = localizacaoSelecionada.cidade;
            dados.latitude = localizacaoSelecionada.latitude;
            dados.longitude = localizacaoSelecionada.longitude;
            dados.precisaoLocalizacao =
                localizacaoSelecionada.precisaoLocalizacao;
        }

        setSalvando(true);

        try {
            // Envia uma nova fotografia antes de atualizar o evento.
            if (imagemArquivo) {
                const resultado = await enviarImagemEvento(
                    imagemArquivo,
                );

                dados.imagemUrl = resultado.imagemUrl;
            } else if (imagemRemovida) {
                dados.imagemUrl = null;
            }

            const resposta = await atualizarEvento(
                eventoOriginal.id,
                dados,
            );

            setMensagem(
                resposta.status === "PENDENTE"
                    ? "Evento atualizado. Ele está aguardando aprovação da administração."
                    : "Evento atualizado com sucesso.",
            );

            setEventoEditandoId(null);
            setTentativa((atual) => atual + 1);
        } catch (erro) {
            setErroAcao(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível atualizar o evento.",
            );
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarExclusao(evento: EventoExplorar) {
        const confirmado = window.confirm(
            `Tem certeza de que deseja excluir o evento "${evento.titulo}"? Essa ação não poderá ser desfeita.`,
        );

        if (!confirmado) return;

        setErroAcao(null);
        setMensagem(null);
        setExcluindoId(evento.id);

        try {
            await excluirEvento(evento.id);

            setEventos((atuais) =>
                atuais.filter((item) => item.id !== evento.id),
            );

            if (eventoEditandoId === evento.id) {
                cancelarEdicao();
            }

            setMensagem("Evento excluído com sucesso.");
        } catch (erro) {
            setErroAcao(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível excluir o evento.",
            );
        } finally {
            setExcluindoId(null);
        }
    }

    return (
        <main className="min-h-screen bg-mare-creme px-5 pb-12 pt-6">
            <div className="mx-auto max-w-7xl">
                <div className="hidden lg:block">
                    <DashboardNavbar
                        nomeUsuario={usuario?.nome ?? ""}
                        paginaAtiva="Perfil"
                    />
                </div>

                <div className="mb-7 mt-5">
                    <Link
                        href="/perfil"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-mare-laranja hover:underline"
                    >
                        <span aria-hidden="true">←</span>
                        Voltar ao perfil
                    </Link>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-mare-rosa">
                                Área do divulgador
                            </p>

                            <h1 className="font-titulo mt-2 text-3xl font-bold text-stone-900">
                                Meus eventos
                            </h1>

                            <p className="mt-2 text-sm text-stone-600">
                                Acompanhe, edite e gerencie os eventos que
                                você cadastrou.
                            </p>
                        </div>

                        <Link
                            href="/divulgar-evento"
                            className="rounded-xl bg-mare-laranja px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
                        >
                            + Divulgar evento
                        </Link>
                    </div>
                </div>

                {mensagem && (
                    <p
                        role="status"
                        className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                    >
                        {mensagem}
                    </p>
                )}

                {erroAcao && (
                    <p
                        role="alert"
                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {erroAcao}
                    </p>
                )}

                {!carregando && !erro && (
                    <section
                        aria-label="Resumo dos eventos"
                        className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >
                        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-stone-500">
                                Pendentes
                            </p>

                            <p className="mt-2 text-3xl font-bold text-amber-700">
                                {pendentes}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-stone-500">
                                Aprovados
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-700">
                                {aprovados}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-stone-500">
                                Rejeitados
                            </p>

                            <p className="mt-2 text-3xl font-bold text-red-700">
                                {rejeitados}
                            </p>
                        </div>
                    </section>
                )}

                {carregando ? (
                    <section
                        role="status"
                        className="rounded-2xl bg-white p-10 text-center shadow-sm"
                    >
                        <p className="font-semibold text-stone-700">
                            Carregando seus eventos...
                        </p>
                    </section>
                ) : erro ? (
                    <section
                        role="alert"
                        className="rounded-2xl bg-white p-8 text-center shadow-sm"
                    >
                        <h2 className="font-titulo text-xl font-bold text-stone-800">
                            Não foi possível carregar seus eventos.
                        </h2>

                        <p className="mt-2 text-sm text-stone-500">
                            {erro}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setTentativa((atual) => atual + 1)
                            }
                            className="mt-5 rounded-xl bg-mare-laranja px-6 py-3 text-sm font-bold text-white"
                        >
                            Tentar novamente
                        </button>
                    </section>
                ) : eventos.length === 0 ? (
                    <section className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
                        <h2 className="font-titulo text-xl font-bold text-stone-800">
                            Você ainda não cadastrou eventos
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">
                            Quando cadastrar um evento, poderá acompanhar
                            sua aprovação nesta página.
                        </p>

                        <Link
                            href="/divulgar-evento"
                            className="mt-6 inline-flex rounded-xl bg-mare-laranja px-6 py-3 text-sm font-bold text-white"
                        >
                            Cadastrar meu primeiro evento
                        </Link>
                    </section>
                ) : (
                    <section className="space-y-4">
                        {eventos.map((evento) => {
                            const status = statusEvento[evento.status];
                            const editando =
                                eventoEditandoId === evento.id;

                            return (
                                <div
                                    key={evento.id}
                                    className="space-y-3"
                                >
                                    <article className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                                        <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                                            <Image
                                                src={evento.imagem}
                                                alt={evento.titulo}
                                                fill
                                                sizes="(min-width: 640px) 160px, 100vw"
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-card text-lg font-bold leading-tight text-stone-900">
                                                {evento.titulo}
                                            </h2>

                                            <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                                                {evento.descricao}
                                            </p>

                                            <p className="mt-2 text-xs text-stone-500">
                                                {evento.data} • {evento.hora}
                                            </p>

                                            <p className="mt-1 text-xs text-stone-500">
                                                {evento.cidade
                                                    ? `${evento.local}, ${evento.cidade}`
                                                    : evento.local}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                                            <span
                                                className={`rounded-full px-4 py-2 text-xs font-bold ${status.classe}`}
                                            >
                                                {status.titulo}
                                            </span>

                                            <div className="flex flex-wrap gap-2">
                                                {evento.status === "APROVADO" && (
                                                    <Link
                                                        href={`/eventos/${evento.id}`}
                                                        className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                                                    >
                                                        Ver evento
                                                    </Link>
                                                )}

                                                <button
                                                    type="button"
                                                    disabled={
                                                        salvando ||
                                                        excluindoId !== null ||
                                                        carregandoCategorias
                                                    }
                                                    onClick={() => {
                                                        if (editando) {
                                                            cancelarEdicao();
                                                        } else {
                                                            abrirEdicao(evento);
                                                        }
                                                    }}
                                                    className="rounded-lg bg-mare-laranja px-3 py-2 text-xs font-bold text-white hover:brightness-95 disabled:opacity-50"
                                                >
                                                    {editando
                                                        ? "Cancelar edição"
                                                        : "Editar"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        salvando ||
                                                        excluindoId !== null
                                                    }
                                                    onClick={() =>
                                                        void confirmarExclusao(evento)
                                                    }
                                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {excluindoId === evento.id
                                                        ? "Excluindo..."
                                                        : "Excluir"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>

                                    {editando && (
                                        <form
                                            id={`editar-evento-${evento.id}`}
                                            onSubmit={(formulario) =>
                                                void salvarEdicao(
                                                    evento,
                                                    formulario,
                                                )
                                            }
                                            className="space-y-5 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-7"
                                        >
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-mare-rosa">
                                                    Editando evento
                                                </p>

                                                <h2 className="font-titulo mt-1 text-2xl font-bold text-stone-900">
                                                    {evento.titulo}
                                                </h2>

                                                {evento.status === "APROVADO" && (
                                                    <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                                        Ao salvar alterações,
                                                        este evento voltará
                                                        para análise
                                                        administrativa.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Título */}
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Nome do evento
                                                </label>

                                                <input
                                                    required
                                                    maxLength={150}
                                                    value={titulo}
                                                    onChange={(e) =>
                                                        setTitulo(e.target.value)
                                                    }
                                                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                                                />
                                            </div>

                                            {/* Descrição */}
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Descrição
                                                </label>

                                                <textarea
                                                    required
                                                    rows={5}
                                                    value={descricao}
                                                    onChange={(e) =>
                                                        setDescricao(e.target.value)
                                                    }
                                                    className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                                                />
                                            </div>

                                            {/* Data */}
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Data e horário
                                                </label>

                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={data}
                                                    onChange={(e) =>
                                                        setData(e.target.value)
                                                    }
                                                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                                                />
                                            </div>

                                            {/* Categoria */}
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Categoria
                                                </label>

                                                <select
                                                    value={categoriaNome}
                                                    onChange={(e) =>
                                                        setCategoriaNome(e.target.value)
                                                    }
                                                    disabled={carregandoCategorias}
                                                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-mare-laranja disabled:bg-stone-100"
                                                >
                                                    <option value="">
                                                        Sem categoria
                                                    </option>

                                                    {categorias.map((categoria) => (
                                                        <option
                                                            key={categoria.id}
                                                            value={categoria.nome}
                                                        >
                                                            {categoria.nome}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Cidade */}
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Cidade
                                                </label>

                                                <select
                                                    value={cidade}
                                                    onChange={(e) =>
                                                        alterarCidade(
                                                            e.target.value as Cidade | "",
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-mare-laranja"
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
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Local ou endereço
                                                </label>

                                                <input
                                                    required
                                                    minLength={3}
                                                    maxLength={200}
                                                    value={local}
                                                    onChange={(e) =>
                                                        alterarLocal(e.target.value)
                                                    }
                                                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja"
                                                />

                                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            buscandoLocalizacao ||
                                                            !cidade
                                                        }
                                                        onClick={() =>
                                                            void pesquisarLocalizacao()
                                                        }
                                                        className="rounded-xl border-2 border-mare-laranja px-4 py-3 text-sm font-bold text-mare-laranja disabled:opacity-50"
                                                    >
                                                        {buscandoLocalizacao
                                                            ? "Buscando..."
                                                            : "Buscar endereço"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={!cidade}
                                                        onClick={() => {
                                                            setLocalizacaoSelecionada(null);
                                                            setResultadosLocalizacao([]);
                                                            setMostrarMapa(true);
                                                            setErroLocalizacao(null);
                                                        }}
                                                        className="rounded-xl border-2 border-violet-600 px-4 py-3 text-sm font-bold text-violet-700 disabled:opacity-50"
                                                    >
                                                        Marcar no mapa
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Resultados de geocodificação */}
                                            {resultadosLocalizacao.length > 0 && (
                                                <div className="space-y-2 rounded-xl bg-stone-50 p-3">
                                                    <p className="text-sm font-bold text-stone-800">
                                                        Selecione o endereço correto
                                                    </p>

                                                    {resultadosLocalizacao.map((resultado) => (
                                                        <button
                                                            key={resultado.id}
                                                            type="button"
                                                            onClick={() =>
                                                                selecionarLocalizacao(resultado)
                                                            }
                                                            className="block w-full rounded-lg border border-stone-200 bg-white p-3 text-left text-sm hover:border-mare-laranja"
                                                        >
                                                            <span className="font-semibold text-stone-800">
                                                                {resultado.nome}
                                                            </span>

                                                            <span className="mt-1 block text-xs text-stone-500">
                                                                {resultado.cidade} •{" "}
                                                                {resultado.precisaoLocalizacao}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Mapa manual */}
                                            {mostrarMapa && cidade && (
                                                <section className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold text-stone-800">
                                                            Selecionar localização
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setMostrarMapa(false)
                                                            }
                                                            className="text-xs font-semibold text-stone-500"
                                                        >
                                                            Fechar mapa
                                                        </button>
                                                    </div>

                                                    <SelecionarLocalizacaoLeaflet
                                                        key={`edicao-${cidade}`}
                                                        cidade={cidade}
                                                        onSelecionar={selecionarCoordenadaManual}
                                                    />
                                                </section>
                                            )}

                                            {localizacaoSelecionada && (
                                                <div
                                                    role="status"
                                                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                                                >
                                                    <p className="text-sm font-bold text-emerald-800">
                                                        Localização selecionada
                                                    </p>

                                                    <p className="mt-1 text-xs text-emerald-700">
                                                        {localizacaoSelecionada.nome}
                                                    </p>

                                                    <p className="text-xs text-emerald-700">
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
                                                </div>
                                            )}

                                            {erroLocalizacao && (
                                                <p
                                                    role="alert"
                                                    className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
                                                >
                                                    {erroLocalizacao}
                                                </p>
                                            )}

                                            {/* Foto */}
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-stone-800">
                                                    Foto do evento
                                                </label>

                                                <p className="mb-3 text-xs text-stone-500">
                                                    JPEG, PNG ou WebP. Máximo de 5 MB.
                                                </p>

                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(e) => {
                                                        selecionarImagem(
                                                            e.currentTarget.files?.[0] ?? null,
                                                        );
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

                                                {imagemPreview ? (
                                                    <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
                                                        <img
                                                            src={imagemPreview}
                                                            alt="Pré-visualização da nova foto"
                                                            className="aspect-video w-full object-cover"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setImagemArquivo(null)
                                                            }
                                                            className="p-3 text-xs font-bold text-red-600"
                                                        >
                                                            Remover nova foto
                                                        </button>
                                                    </div>
                                                ) : evento.imagemUrl && !imagemRemovida ? (
                                                    <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
                                                        <div className="relative aspect-video">
                                                            <Image
                                                                src={evento.imagem}
                                                                alt="Foto atual do evento"
                                                                fill
                                                                sizes="(min-width: 640px) 600px, 100vw"
                                                                className="object-cover"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setImagemRemovida(true)
                                                            }
                                                            className="p-3 text-xs font-bold text-red-600"
                                                        >
                                                            Remover foto atual
                                                        </button>
                                                    </div>
                                                ) : imagemRemovida ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setImagemRemovida(false)
                                                        }
                                                        className="mt-3 text-xs font-bold text-mare-laranja hover:underline"
                                                    >
                                                        Restaurar foto atual
                                                    </button>
                                                ) : (
                                                    <p className="mt-3 text-xs text-stone-500">
                                                        Este evento não possui uma foto própria. A imagem padrão da categoria será utilizada.
                                                    </p>
                                                )}
                                            </div>

                                            {erroAcao && (
                                                <p
                                                    role="alert"
                                                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                                                >
                                                    {erroAcao}
                                                </p>
                                            )}

                                            {/* Ações */}
                                            <div className="flex flex-wrap justify-end gap-3 border-t border-stone-100 pt-4">
                                                <button
                                                    type="button"
                                                    disabled={salvando}
                                                    onClick={cancelarEdicao}
                                                    className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        salvando ||
                                                        buscandoLocalizacao
                                                    }
                                                    className="rounded-xl bg-mare-laranja px-6 py-3 text-sm font-bold text-white shadow-sm hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {salvando
                                                        ? imagemArquivo
                                                            ? "Enviando foto e alterações..."
                                                            : "Salvando alterações..."
                                                        : "Salvar alterações"}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                )}
            </div>
        </main>
    );
}
