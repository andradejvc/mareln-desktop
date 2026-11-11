
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarEventosAdmin,
  atualizarStatusEvento,
  type EventoAdmin,
  type StatusEventoAdmin,
} from "@/lib/admin-api";

import { useUsuario } from "@/lib/usuario";

type FiltroStatus = "TODOS" | StatusEventoAdmin | "PENDENTE";

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

export default function ModeracaoEventosView() {
  const usuario = useUsuario();

  const [eventos, setEventos] = useState<EventoAdmin[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("TODOS");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [eventoAtualizando, setEventoAtualizando] = useState<number | null>(
    null,
  );

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

  const contagens = useMemo(
    () => ({
      TODOS: eventos.length,
      PENDENTE: eventos.filter((evento) => evento.status === "PENDENTE")
        .length,
      APROVADO: eventos.filter((evento) => evento.status === "APROVADO")
        .length,
      REJEITADO: eventos.filter((evento) => evento.status === "REJEITADO")
        .length,
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

  async function alterarStatus(
    evento: EventoAdmin,
    status: StatusEventoAdmin,
  ) {
    const acao = status === "APROVADO" ? "aprovar" : "rejeitar";

    const confirmado = window.confirm(
      `Deseja realmente ${acao} o evento "${evento.titulo}"?`,
    );

    if (!confirmado) return;

    setEventoAtualizando(evento.id);
    setErro(null);

    try {
      await atualizarStatusEvento(evento.id, status);

      setEventos((atuais) =>
        atuais.map((item) =>
          item.id === evento.id
            ? { ...item, status }
            : item,
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
            Analise os eventos cadastrados pelos divulgadores e controle
            quais serão publicados na plataforma.
          </p>
        </header>

        {!carregando && !erro && (
          <section
            aria-label="Resumo dos eventos"
            className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              {
                titulo: "Total",
                valor: contagens.TODOS,
                classe: "text-stone-800",
              },
              {
                titulo: "Pendentes",
                valor: contagens.PENDENTE,
                classe: "text-amber-700",
              },
              {
                titulo: "Aprovados",
                valor: contagens.APROVADO,
                classe: "text-emerald-700",
              },
              {
                titulo: "Rejeitados",
                valor: contagens.REJEITADO,
                classe: "text-red-700",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-stone-500">
                  {item.titulo}
                </p>
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
                  <span className="ml-2 opacity-80">
                    {contagens[item.valor]}
                  </span>
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

            <p className="mt-2 text-sm text-stone-600">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => setTentativa((atual) => atual + 1)}
              className="mt-4 rounded-xl bg-mare-laranja px-5 py-2.5 text-sm font-bold text-white"
            >
              Recarregar eventos
            </button>
          </section>
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

              return (
                <article
                  key={evento.id}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
                >
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

                  {evento.status === "PENDENTE" && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={atualizando}
                        onClick={() =>
                          void alterarStatus(evento, "REJEITADO")
                        }
                        className="rounded-xl border border-red-300 px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {atualizando ? "Atualizando..." : "Rejeitar evento"}
                      </button>

                      <button
                        type="button"
                        disabled={atualizando}
                        onClick={() =>
                          void alterarStatus(evento, "APROVADO")
                        }
                        className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {atualizando ? "Atualizando..." : "Aprovar evento"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        ) : null}
      </div>
    </main>
  );
}
