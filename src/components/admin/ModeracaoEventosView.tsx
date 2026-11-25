"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  listarEventosAdmin,
  atualizarStatusEvento,
  type EventoAdmin,
  type StatusEventoAdmin,
} from "@/lib/admin-api";

import {
  atualizarEvento,
  excluirEvento,
  enviarImagemEvento,
  listarCategorias,
  type AtualizarEvento,
  type CategoriaBackend,
} from "@/lib/eventos-api";

import { cidades, type Cidade } from "@/data/eventos";
import {
  buscarLocalizacoes,
  type ResultadoGeocodificacao,
} from "@/lib/geocoding-api";
import SelecionarLocalizacaoLeaflet, {
  type CoordenadaSelecionada,
} from "@/components/mapa/SelecionarLocalizacaoLeaflet";

import { useUsuario } from "@/lib/usuario";

type FiltroStatus = "TODOS" | StatusEventoAdmin | "PENDENTE";

type LocalizacaoEdicao = {
  nome: string;
  cidade: Cidade;
  latitude: number;
  longitude: number;
  precisaoLocalizacao: "EXATA" | "APROXIMADA";
};

const statusInfo = {
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

const tiposImagemPermitidos = ["image/jpeg", "image/png", "image/webp"];
const tamanhoMaximoImagem = 5 * 1024 * 1024;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

function formatarData(data: string) {
  const dataEvento = new Date(data);

  if (Number.isNaN(dataEvento.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(dataEvento);
}

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

function obterUrlImagem(imagemUrl: string | null) {
  if (!imagemUrl) return null;

  if (/^https?:\/\//i.test(imagemUrl)) {
    return imagemUrl;
  }

  return `${API_BASE_URL ?? ""}${imagemUrl}`;
}

export default function ModeracaoEventosView() {
  const usuario = useUsuario();

  const [eventos, setEventos] = useState<EventoAdmin[]>([]);
  const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("TODOS");

  const [carregando, setCarregando] = useState(true);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCategorias, setErroCategorias] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [eventoAtualizando, setEventoAtualizando] = useState<number | null>(null);
  const [eventoExcluindoId, setEventoExcluindoId] = useState<number | null>(null);
  const [eventoEditandoId, setEventoEditandoId] = useState<number | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Campos do formulário administrativo.
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [cidade, setCidade] = useState<Cidade | "">("");
  const [categoriaId, setCategoriaId] = useState("");

  // Localização do evento.
  const [localizacaoSelecionada, setLocalizacaoSelecionada] =
    useState<LocalizacaoEdicao | null>(null);
  const [resultadosLocalizacao, setResultadosLocalizacao] =
    useState<ResultadoGeocodificacao[]>([]);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

  // Imagem do evento.
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemRemovida, setImagemRemovida] = useState(false);
  const [erroImagem, setErroImagem] = useState<string | null>(null);
  const inputImagemRef = useRef<HTMLInputElement>(null);

  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarEventos() {
      if (usuario?.tipo !== "ADMIN") {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const resposta = await listarEventosAdmin();

        if (ativo) {
          setEventos(resposta);
        }
      } catch (erro) {
        if (ativo) {
          setErro(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar os eventos.",
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
  }, [usuario?.tipo, tentativa]);

  useEffect(() => {
    let ativo = true;

    async function carregarCategorias() {
      try {
        const resposta = await listarCategorias();

        if (ativo) {
          setCategorias(resposta);
          setErroCategorias(null);
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

    if (usuario?.tipo === "ADMIN") {
      void carregarCategorias();
    }

    return () => {
      ativo = false;
    };
  }, [usuario?.tipo]);

  useEffect(() => {
    if (!imagemArquivo) {
      setImagemPreview(null);
      return;
    }

    const url = URL.createObjectURL(imagemArquivo);
    setImagemPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imagemArquivo]);

  const contagens = useMemo(
    () => ({
      TODOS: eventos.length,
      PENDENTE: eventos.filter((evento) => evento.status === "PENDENTE").length,
      APROVADO: eventos.filter((evento) => evento.status === "APROVADO").length,
      REJEITADO: eventos.filter((evento) => evento.status === "REJEITADO").length,
    }),
    [eventos],
  );

  const eventosFiltrados = useMemo(
    () =>
      filtro === "TODOS"
        ? eventos
        : eventos.filter((evento) => evento.status === filtro),
    [eventos, filtro],
  );

  function limparFormulario() {
    setEventoEditandoId(null);
    setErroAcao(null);
    setTitulo("");
    setDescricao("");
    setData("");
    setLocal("");
    setCidade("");
    setCategoriaId("");
    setLocalizacaoSelecionada(null);
    setResultadosLocalizacao([]);
    setMostrarMapa(false);
    setBuscandoLocalizacao(false);
    setErroLocalizacao(null);
    setImagemArquivo(null);
    setImagemPreview(null);
    setImagemRemovida(false);
    setErroImagem(null);
    setErroFormulario(null);
    if (inputImagemRef.current) {
      inputImagemRef.current.value = "";
    }
  }

  function abrirEdicao(evento: EventoAdmin) {
    setMensagem(null);
    setErroAcao(null);
    setErroFormulario(null);
    setErroLocalizacao(null);
    setErroImagem(null);

    setTitulo(evento.titulo);
    setDescricao(evento.descricao);
    setData(formatarDataParaInput(evento.data));
    setLocal(evento.local);
    const cidadeExistente = cidades.find((item) => item === evento.cidade) ?? "";
    setCidade(cidadeExistente);
    setCategoriaId(evento.categoriaId?.toString() ?? "");

    if (
      cidadeExistente &&
      evento.latitude !== null &&
      evento.longitude !== null &&
      evento.precisaoLocalizacao
    ) {
      setLocalizacaoSelecionada({
        nome: evento.local,
        cidade: cidadeExistente,
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
    if (inputImagemRef.current) {
      inputImagemRef.current.value = "";
    }
    setEventoEditandoId(evento.id);

    window.setTimeout(() => {
      document
        .getElementById(`editar-evento-admin-${evento.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
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
      setErroLocalizacao("Informe um endereço ou nome de local mais completo.");
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

  function selecionarLocalizacao(resultado: ResultadoGeocodificacao) {
    setLocalizacaoSelecionada({
      nome: resultado.nome,
      cidade: resultado.cidade,
      latitude: resultado.latitude,
      longitude: resultado.longitude,
      precisaoLocalizacao: resultado.precisaoLocalizacao,
    });
    setCidade(resultado.cidade);
    setMostrarMapa(false);
    setErroLocalizacao(null);
  }

  function selecionarCoordenadaManual(coordenadas: CoordenadaSelecionada) {
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
      setErroImagem("Formato inválido. Escolha uma imagem JPEG, PNG ou WebP.");
      if (inputImagemRef.current) inputImagemRef.current.value = "";
      return;
    }

    if (arquivo.size === 0) {
      setImagemArquivo(null);
      setErroImagem("O arquivo selecionado está vazio.");
      if (inputImagemRef.current) inputImagemRef.current.value = "";
      return;
    }

    if (arquivo.size > tamanhoMaximoImagem) {
      setImagemArquivo(null);
      setErroImagem("A imagem deve ter no máximo 5 MB.");
      if (inputImagemRef.current) inputImagemRef.current.value = "";
      return;
    }

    setImagemArquivo(arquivo);
    setImagemRemovida(false);
  }

  async function salvarEdicao(
    eventoOriginal: EventoAdmin,
    formulario: FormEvent<HTMLFormElement>,
  ) {
    formulario.preventDefault();

    if (salvando) return;

    setErroFormulario(null);
    setMensagem(null);

    if (!titulo.trim() || !descricao.trim() || !local.trim()) {
      setErroFormulario("Preencha o título, a descrição e o local do evento.");
      return;
    }

    if (!data) {
      setErroFormulario("Informe a data e o horário do evento.");
      return;
    }

    if (
      localizacaoSelecionada &&
      cidade !== localizacaoSelecionada.cidade
    ) {
      setErroFormulario(
        "A localização selecionada não corresponde à cidade informada.",
      );
      return;
    }

    const dataConvertida = new Date(data);
    if (Number.isNaN(dataConvertida.getTime())) {
      setErroFormulario("Informe uma data e horário válidos.");
      return;
    }

    const categoriaSelecionada = categoriaId
      ? categorias.find((item) => item.id === Number(categoriaId)) ?? null
      : null;

    if (categoriaId && !categoriaSelecionada) {
      setErroFormulario("Selecione uma categoria válida.");
      return;
    }

    const dados: AtualizarEvento = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data: dataConvertida.toISOString(),
      local: local.trim(),
      categoriaId: categoriaSelecionada?.id ?? null,
    };

    if (cidade) {
      dados.cidade = cidade;
    }

    if (localizacaoSelecionada) {
      dados.cidade = localizacaoSelecionada.cidade;
      dados.latitude = localizacaoSelecionada.latitude;
      dados.longitude = localizacaoSelecionada.longitude;
      dados.precisaoLocalizacao = localizacaoSelecionada.precisaoLocalizacao;
    }

    setSalvando(true);
    setEventoAtualizando(eventoOriginal.id);

    try {
      if (imagemArquivo) {
        const resultadoUpload = await enviarImagemEvento(imagemArquivo);
        dados.imagemUrl = resultadoUpload.imagemUrl;
      } else if (imagemRemovida) {
        dados.imagemUrl = null;
      }

      const resposta = await atualizarEvento(eventoOriginal.id, dados);

      setEventos((atuais) =>
        atuais.map((item) =>
          item.id === eventoOriginal.id
            ? {
                ...item,
                ...resposta,
                usuario: eventoOriginal.usuario,
                categoria: categoriaSelecionada,
              }
            : item,
        ),
      );

      setMensagem(
        `Evento #${eventoOriginal.id} atualizado. O status foi preservado como ${
          statusInfo[resposta.status].titulo.toLowerCase()
        }.`,
      );
      limparFormulario();
    } catch (erro) {
      setErroFormulario(
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o evento.",
      );
    } finally {
      setSalvando(false);
      setEventoAtualizando(null);
    }
  }

  async function excluirEventoAdmin(evento: EventoAdmin) {
    if (
      eventoAtualizando !== null ||
      eventoExcluindoId !== null ||
      eventoEditandoId !== null
    ) {
      return;
    }

    const confirmado = window.confirm(
      `Tem certeza de que deseja excluir o evento "${evento.titulo}"? Essa ação não poderá ser desfeita.`,
    );

    if (!confirmado) return;

    setEventoExcluindoId(evento.id);
    setErroAcao(null);
    setErro(null);
    setMensagem(null);

    try {
      await excluirEvento(evento.id);

      setEventos((atuais) => atuais.filter((item) => item.id !== evento.id));
      setMensagem(`Evento "${evento.titulo}" excluído com sucesso.`);
    } catch (erro) {
      setErroAcao(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir o evento.",
      );
    } finally {
      setEventoExcluindoId(null);
    }
  }

  async function alterarStatus(evento: EventoAdmin, status: StatusEventoAdmin) {
    const acao = status === "APROVADO" ? "aprovar" : "rejeitar";
    const confirmado = window.confirm(
      `Deseja realmente ${acao} o evento "${evento.titulo}"?`,
    );

    if (!confirmado) return;

    setEventoAtualizando(evento.id);
    setErro(null);
    setMensagem(null);

    try {
      await atualizarStatusEvento(evento.id, status);
      setEventos((atuais) =>
        atuais.map((item) =>
          item.id === evento.id ? { ...item, status } : item,
        ),
      );
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o status do evento.",
      );
    } finally {
      setEventoAtualizando(null);
    }
  }

  if (usuario?.tipo !== "ADMIN") {
    return (
      <main className="min-h-screen bg-mare-creme px-5 py-12">
        <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-titulo text-2xl font-bold text-stone-800">
            Acesso restrito
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            Somente administradores podem acessar a moderação de eventos.
          </p>
        </section>
      </main>
    );
  }

  const filtros: { valor: FiltroStatus; titulo: string }[] = [
    { valor: "TODOS", titulo: "Todos" },
    { valor: "PENDENTE", titulo: "Pendentes" },
    { valor: "APROVADO", titulo: "Aprovados" },
    { valor: "REJEITADO", titulo: "Rejeitados" },
  ];

  return (
    <main className="min-h-screen bg-mare-creme px-5 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-mare-rosa">
            Painel administrativo
          </p>
          <h1 className="font-titulo mt-2 text-3xl font-bold text-stone-900">
            Moderação de eventos
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Analise, edite e controle os eventos cadastrados pelos divulgadores.
            As edições administrativas preservam o status atual do evento.
          </p>
        </header>

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
            className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              { titulo: "Total", valor: contagens.TODOS, classe: "text-stone-800" },
              { titulo: "Pendentes", valor: contagens.PENDENTE, classe: "text-amber-700" },
              { titulo: "Aprovados", valor: contagens.APROVADO, classe: "text-emerald-700" },
              { titulo: "Rejeitados", valor: contagens.REJEITADO, classe: "text-red-700" },
            ].map((item) => (
              <div
                key={item.titulo}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-stone-500">{item.titulo}</p>
                <p className={`mt-2 text-3xl font-bold ${item.classe}`}>
                  {item.valor}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="mb-6">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filtrar eventos por status"
          >
            {filtros.map((item) => (
              <button
                key={item.valor}
                type="button"
                aria-pressed={filtro === item.valor}
                onClick={() => setFiltro(item.valor)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  filtro === item.valor
                    ? "border-mare-laranja bg-mare-laranja text-white"
                    : "border-stone-300 bg-white text-stone-600 hover:border-mare-laranja hover:text-mare-laranja"
                }`}
              >
                {item.titulo}
                {!carregando && !erro && (
                  <span className="ml-2 opacity-80">{contagens[item.valor]}</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {erro && (
          <section
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-white p-6"
          >
            <p className="font-semibold text-red-700">
              Não foi possível carregar ou atualizar os eventos.
            </p>
            <p className="mt-2 text-sm text-stone-600">{erro}</p>
            <button
              type="button"
              onClick={() => setTentativa((atual) => atual + 1)}
              className="mt-4 rounded-xl bg-mare-laranja px-5 py-2.5 text-sm font-bold text-white"
            >
              Recarregar eventos
            </button>
          </section>
        )}

        {erroCategorias && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Não foi possível carregar as categorias: {erroCategorias}
          </p>
        )}

        {carregando ? (
          <section
            role="status"
            className="rounded-2xl bg-white p-10 text-center shadow-sm"
          >
            <p className="font-semibold text-stone-700">
              Carregando eventos para moderação...
            </p>
          </section>
        ) : !erro && eventosFiltrados.length === 0 ? (
          <section className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="font-titulo text-xl font-bold text-stone-800">
              Nenhum evento encontrado
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Não existem eventos com o filtro selecionado.
            </p>
          </section>
        ) : !erro ? (
          <section className="space-y-4">
            {eventosFiltrados.map((evento) => {
              const status = statusInfo[evento.status];
              const atualizando = eventoAtualizando === evento.id;
              const editando = eventoEditandoId === evento.id;
              const imagemAtual = obterUrlImagem(evento.imagemUrl);

              return (
                <div key={evento.id} className="space-y-3">
                  <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-mare-rosa">
                          Evento #{evento.id}
                        </p>
                        <h2 className="font-card mt-2 text-xl font-bold text-stone-900">
                          {evento.titulo}
                        </h2>
                      </div>
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${status.classe}`}
                      >
                        {status.titulo}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                      {evento.descricao}
                    </p>

                    <div className="mt-5 grid gap-3 border-t border-stone-100 pt-4 text-sm text-stone-600 sm:grid-cols-2">
                      <p>
                        <strong className="text-stone-800">Data:</strong>{" "}
                        {formatarData(evento.data)}
                      </p>
                      <p>
                        <strong className="text-stone-800">Local:</strong>{" "}
                        {evento.local}
                        {evento.cidade ? `, ${evento.cidade}` : ""}
                      </p>
                      <p>
                        <strong className="text-stone-800">Categoria:</strong>{" "}
                        {evento.categoria?.nome ?? "Sem categoria"}
                      </p>
                      <p>
                        <strong className="text-stone-800">Divulgador:</strong>{" "}
                        {evento.usuario?.nome ?? "Não informado"}
                      </p>
                      {evento.usuario?.email && (
                        <p className="sm:col-span-2">
                          <strong className="text-stone-800">E-mail:</strong>{" "}
                          {evento.usuario.email}
                        </p>
                      )}
                    </div>

                    {imagemAtual && (
                      <div className="mt-4 max-w-sm overflow-hidden rounded-xl border border-stone-200">
                        <Image
                          src={imagemAtual}
                          alt={`Imagem do evento ${evento.titulo}`}
                          width={640}
                          height={360}
                          className="aspect-video w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
                      <button
                        type="button"
                        disabled={
                          eventoAtualizando !== null ||
                          eventoExcluindoId !== null ||
                          (eventoEditandoId !== null && !editando)
                        }
                        onClick={() => {
                          if (editando) {
                            limparFormulario();
                          } else {
                            limparFormulario();
                            abrirEdicao(evento);
                          }
                        }}
                        className="rounded-xl border border-mare-laranja px-6 py-3 text-sm font-bold text-mare-laranja transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {editando ? "Fechar edição" : "Editar evento"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          eventoAtualizando !== null ||
                          eventoExcluindoId !== null ||
                          eventoEditandoId !== null
                        }
                        onClick={() => void excluirEventoAdmin(evento)}
                        className="rounded-xl border border-red-300 px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {eventoExcluindoId === evento.id
                          ? "Excluindo..."
                          : "Excluir evento"}
                      </button>

                      {evento.status === "PENDENTE" && (
                        <>
                          <button
                            type="button"
                            disabled={
                              eventoAtualizando !== null ||
                              eventoExcluindoId !== null ||
                              eventoEditandoId !== null
                            }
                            onClick={() => void alterarStatus(evento, "REJEITADO")}
                            className="rounded-xl border border-red-300 px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {atualizando ? "Atualizando..." : "Rejeitar evento"}
                          </button>
                          <button
                            type="button"
                            disabled={
                              eventoAtualizando !== null ||
                              eventoExcluindoId !== null ||
                              eventoEditandoId !== null
                            }
                            onClick={() => void alterarStatus(evento, "APROVADO")}
                            className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {atualizando ? "Atualizando..." : "Aprovar evento"}
                          </button>
                        </>
                      )}
                    </div>
                  </article>

                  {editando && (
                    <form
                      id={`editar-evento-admin-${evento.id}`}
                      onSubmit={(formulario) => void salvarEdicao(evento, formulario)}
                      className="space-y-5 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-7"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-mare-rosa">
                          Edição administrativa
                        </p>
                        <h3 className="font-titulo mt-1 text-2xl font-bold text-stone-900">
                          Editar evento #{evento.id}
                        </h3>
                        <p className="mt-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                          A edição administrativa preserva o status atual: {statusInfo[evento.status].titulo.toLowerCase()}.
                        </p>
                      </div>

                      <div>
                        <label htmlFor={`admin-titulo-${evento.id}`} className="mb-2 block text-sm font-bold text-stone-800">
                          Nome do evento
                        </label>
                        <input
                          id={`admin-titulo-${evento.id}`}
                          required
                          maxLength={150}
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                        />
                      </div>

                      <div>
                        <label htmlFor={`admin-descricao-${evento.id}`} className="mb-2 block text-sm font-bold text-stone-800">
                          Descrição
                        </label>
                        <textarea
                          id={`admin-descricao-${evento.id}`}
                          required
                          rows={5}
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                        />
                      </div>

                      <div>
                        <label htmlFor={`admin-data-${evento.id}`} className="mb-2 block text-sm font-bold text-stone-800">
                          Data e horário
                        </label>
                        <input
                          id={`admin-data-${evento.id}`}
                          type="datetime-local"
                          required
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
                        />
                      </div>

                      <div>
                        <label htmlFor={`admin-categoria-${evento.id}`} className="mb-2 block text-sm font-bold text-stone-800">
                          Categoria
                        </label>
                        <select
                          id={`admin-categoria-${evento.id}`}
                          value={categoriaId}
                          onChange={(e) => setCategoriaId(e.target.value)}
                          disabled={carregandoCategorias}
                          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-mare-laranja disabled:bg-stone-100"
                        >
                          <option value="">Sem categoria</option>
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id.toString()}>
                              {categoria.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor={`admin-cidade-${evento.id}`} className="mb-2 block text-sm font-bold text-stone-800">
                          Cidade
                        </label>
                        <select
                          id={`admin-cidade-${evento.id}`}
                          value={cidade}
                          onChange={(e) => alterarCidade(e.target.value as Cidade | "")}
                          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-mare-laranja"
                        >
                          <option value="">Selecione a cidade</option>
                          {cidades.map((nome) => (
                            <option key={nome} value={nome}>{nome}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor={`admin-local-${evento.id}`} className="mb-2 block text-sm font-bold text-stone-800">
                          Local ou endereço
                        </label>
                        <input
                          id={`admin-local-${evento.id}`}
                          required
                          minLength={3}
                          maxLength={200}
                          value={local}
                          onChange={(e) => alterarLocal(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-mare-laranja"
                        />
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            disabled={buscandoLocalizacao || !cidade}
                            onClick={() => void pesquisarLocalizacao()}
                            className="rounded-xl border-2 border-mare-laranja px-4 py-3 text-sm font-bold text-mare-laranja disabled:opacity-50"
                          >
                            {buscandoLocalizacao ? "Buscando..." : "Buscar endereço"}
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

                      {resultadosLocalizacao.length > 0 && (
                        <div className="space-y-2 rounded-xl bg-stone-50 p-3">
                          <p className="text-sm font-bold text-stone-800">
                            Selecione o endereço correto
                          </p>
                          {resultadosLocalizacao.map((resultado) => (
                            <button
                              key={resultado.id}
                              type="button"
                              onClick={() => selecionarLocalizacao(resultado)}
                              className="block w-full rounded-lg border border-stone-200 bg-white p-3 text-left text-sm hover:border-mare-laranja"
                            >
                              <span className="font-semibold text-stone-800">{resultado.nome}</span>
                              <span className="mt-1 block text-xs text-stone-500">
                                {resultado.cidade} • {resultado.precisaoLocalizacao}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {mostrarMapa && cidade && (
                        <section className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-stone-800">Selecionar localização</p>
                            <button
                              type="button"
                              onClick={() => setMostrarMapa(false)}
                              className="text-xs font-semibold text-stone-500"
                            >
                              Fechar mapa
                            </button>
                          </div>
                          <SelecionarLocalizacaoLeaflet
                            key={`admin-edicao-${cidade}`}
                            cidade={cidade}
                            onSelecionar={selecionarCoordenadaManual}
                          />
                        </section>
                      )}

                      {localizacaoSelecionada && (
                        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-sm font-bold text-emerald-800">Localização selecionada</p>
                          <p className="mt-1 text-xs text-emerald-700">
                            {localizacaoSelecionada.nome} — {localizacaoSelecionada.cidade}
                          </p>
                          <p className="mt-1 text-xs text-emerald-700">
                            Latitude: {localizacaoSelecionada.latitude.toFixed(6)} · Longitude: {localizacaoSelecionada.longitude.toFixed(6)}
                          </p>
                          <p className="text-xs text-emerald-700">
                            Precisão: {localizacaoSelecionada.precisaoLocalizacao}
                          </p>
                        </div>
                      )}

                      {erroLocalizacao && (
                        <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                          {erroLocalizacao}
                        </p>
                      )}

                      <div>
                        <label className="mb-2 block text-sm font-bold text-stone-800" htmlFor={`admin-imagem-${evento.id}`}>
                          Foto do evento
                        </label>
                        <p className="mb-3 text-xs text-stone-500">JPEG, PNG ou WebP. Máximo de 5 MB.</p>
                        <input
                          ref={inputImagemRef}
                          id={`admin-imagem-${evento.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => selecionarImagem(e.currentTarget.files?.[0] ?? null)}
                          className="block w-full rounded-xl border border-stone-300 bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-mare-laranja"
                        />
                        {erroImagem && (
                          <p role="alert" className="mt-2 text-sm text-red-600">{erroImagem}</p>
                        )}

                        {imagemPreview ? (
                          <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
                            {/* Blob local criado pela pré-visualização do arquivo selecionado. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagemPreview} alt="Pré-visualização da nova foto" className="aspect-video w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setImagemArquivo(null);
                                if (inputImagemRef.current) inputImagemRef.current.value = "";
                              }}
                              className="p-3 text-xs font-bold text-red-600"
                            >
                              Remover nova foto
                            </button>
                          </div>
                        ) : imagemAtual && !imagemRemovida ? (
                          <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
                            <div className="relative aspect-video">
                              <Image
                                src={imagemAtual}
                                alt={`Foto atual do evento ${evento.titulo}`}
                                fill
                                sizes="(min-width: 640px) 600px, 100vw"
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setImagemRemovida(true)}
                              className="p-3 text-xs font-bold text-red-600"
                            >
                              Remover foto atual
                            </button>
                          </div>
                        ) : imagemRemovida ? (
                          <button
                            type="button"
                            onClick={() => setImagemRemovida(false)}
                            className="mt-3 text-xs font-bold text-mare-laranja hover:underline"
                          >
                            Restaurar foto atual
                          </button>
                        ) : (
                          <p className="mt-3 text-xs text-stone-500">
                            Este evento não possui uma foto própria.
                          </p>
                        )}
                      </div>

                      {erroFormulario && (
                        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                          {erroFormulario}
                        </p>
                      )}

                      <div className="flex flex-wrap justify-end gap-3 border-t border-stone-100 pt-4">
                        <button
                          type="button"
                          disabled={salvando}
                          onClick={limparFormulario}
                          className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={salvando || buscandoLocalizacao || carregandoCategorias}
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
        ) : null}
      </div>
    </main>
  );
}
