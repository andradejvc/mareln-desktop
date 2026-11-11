
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  listarMeusEventos,
  type EventoExplorar,
} from "@/lib/eventos-api";

import { useSessao } from "@/lib/usuario";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

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

export default function MeusEventosView() {
  const { usuario } = useSessao();

  const [eventos, setEventos] = useState<EventoExplorar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

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

  const pendentes = eventos.filter(
    (evento) => evento.status === "PENDENTE",
  ).length;

  const aprovados = eventos.filter(
    (evento) => evento.status === "APROVADO",
  ).length;

  const rejeitados = eventos.filter(
    (evento) => evento.status === "REJEITADO",
  ).length;

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
                Acompanhe os eventos que você cadastrou e seus respectivos
                status.
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
              onClick={() => setTentativa((atual) => atual + 1)}
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
              Quando cadastrar um evento, poderá acompanhar sua aprovação
              nesta página.
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

              return (
                <article
                  key={evento.id}
                  className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
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

                    {evento.status === "APROVADO" && (
                      <Link
                        href={`/eventos/${evento.id}`}
                        className="text-sm font-bold text-mare-laranja hover:underline"
                      >
                        Ver evento
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
