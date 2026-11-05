"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Evento } from "@/data/eventos";
import type { DetalhesEvento } from "@/data/detalhesEventos";
import { useEventosMarcados } from "@/lib/eventosMarcados";
import { useFavoritos } from "@/lib/favoritos";
import { useSessao } from "@/lib/usuario";
import CabecalhoMobile from "@/components/explorar/CabecalhoMobile";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { BotaoFavorito } from "@/components/dashboard/partes";
import {
  IconeBusca,
  IconeCalendario,
  IconeCoracao,
  IconeInicio,
  IconePino,
  IconeSeta,
  IconeUsuario,
} from "@/components/dashboard/icons";

type Props = {
  evento: Evento;
  detalhes: DetalhesEvento;
};

const abas = [
  { href: "/dashboard", label: "Início", Icone: IconeInicio },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca },
  { href: "/mapa", label: "Mapa", Icone: IconeSeta },
  { href: "/favoritos", label: "Favoritos", Icone: IconeCoracao },
  { href: "/perfil", label: "Perfil", Icone: IconeUsuario },
];

export default function EventoDetalheView({ evento, detalhes }: Props) {
  const { usuario } = useSessao();
  const { favoritos, alternarFavorito } = useFavoritos();
  const { eventosMarcados, alternarEventoMarcado } = useEventosMarcados();
  const [mensagemCompartilhamento, setMensagemCompartilhamento] = useState("");

  const favorito = favoritos.includes(evento.id);
  const marcado = eventosMarcados.includes(evento.id);

  async function compartilharEvento() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: evento.titulo,
          text: `Confira este evento: ${evento.titulo}`,
          url,
        });
        setMensagemCompartilhamento("");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMensagemCompartilhamento("Link do evento copiado.");
        return;
      }

      setMensagemCompartilhamento(
        "O compartilhamento não está disponível neste navegador.",
      );
    } catch (erro) {
      if (erro instanceof Error && erro.name === "AbortError") return;
      setMensagemCompartilhamento("Não foi possível compartilhar o evento.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-28 lg:max-w-7xl lg:px-6 lg:py-5">
      {/* Cabeçalho mobile */}
      <div className="lg:hidden">
        <CabecalhoMobile sessao="logado" paginaAtiva="Detalhes" />
      </div>

      {/* Navegação desktop */}
      <div className="hidden lg:block">
        <DashboardNavbar
          nomeUsuario={usuario?.nome ?? ""}
          totalFavoritos={favoritos.length}
          paginaAtiva="Explorar"
        />
      </div>

      <main className="px-5 pt-6 lg:px-0 lg:pt-8">
        <Link
          href="/explorar"
          className="inline-flex items-center gap-2 text-sm font-semibold text-mare-laranja transition hover:underline"
        >
          <span aria-hidden="true">←</span>
          Voltar para eventos
        </Link>

        <h1 className="font-titulo mx-auto mb-5 mt-5 max-w-4xl text-center text-2xl uppercase leading-tight lg:mb-6 lg:mt-7 lg:text-3xl">
          {evento.titulo}
        </h1>

        {/* Imagem principal e categoria */}
        <section
          aria-label={`Imagem do evento ${evento.titulo}`}
          className="relative h-56 overflow-hidden rounded-2xl sm:h-72 lg:h-[340px] lg:rounded-[24px]"
        >
          <Image
            src={evento.imagem}
            alt={evento.titulo}
            fill
            priority
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 bg-emerald-300 px-4 py-2 text-center text-xs font-extrabold uppercase tracking-[0.45em] text-emerald-900 lg:py-3 lg:text-sm lg:tracking-[0.8em]">
            {evento.categoria}
          </div>
        </section>

        {/* Descrição, ações e recomendações */}
        <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:gap-6">
          <section className="rounded-[22px] bg-mare-laranja p-5 text-white sm:p-7 lg:rounded-br-[54px] lg:p-8">
            <h2 className="font-card text-3xl font-bold lg:text-4xl">
              Descrição
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-relaxed sm:text-base">
              {detalhes.descricao.map((paragrafo, indice) => (
                <p key={indice}>{paragrafo}</p>
              ))}
            </div>

            <div className="mt-7 border-t border-white/30 pt-5 text-sm font-semibold leading-relaxed">
              <p className="flex items-center gap-2">
                <IconeCalendario size={16} />
                Data: {evento.data} • {evento.hora}
              </p>
              <p className="mt-2 flex items-start gap-2">
                <IconePino size={16} className="mt-0.5 shrink-0" />
                Local: {evento.local}, {evento.cidade}
              </p>
              <p className="mt-2">Categoria: {evento.categoria}</p>
              {typeof evento.gratuito === "boolean" && (
                <p className="mt-2">
                  Entrada: {evento.gratuito ? "Gratuita" : "Paga"}
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            {/* Ações */}
            <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <button
                  type="button"
                  onClick={() => void compartilharEvento()}
                  aria-label="Compartilhar evento"
                  className="grid size-11 place-items-center rounded-full border border-violet-500 text-violet-600 transition hover:bg-violet-50"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
                  </svg>
                </button>

                <BotaoFavorito
                  evento={evento}
                  ativo={favorito}
                  onAlternar={alternarFavorito}
                  className="size-11 border border-violet-500 text-violet-600 shadow-none"
                />
              </div>

              {mensagemCompartilhamento && (
                <p role="status" className="mt-3 text-center text-xs text-stone-500">
                  {mensagemCompartilhamento}
                </p>
              )}

              <button
                type="button"
                aria-pressed={marcado}
                onClick={() => alternarEventoMarcado(evento.id)}
                className={`mt-4 w-full rounded-full border-2 px-5 py-3 font-titulo text-lg font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mare-laranja ${
                  marcado
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-mare-laranja bg-white text-mare-laranja hover:bg-mare-laranja hover:text-white"
                }`}
              >
                {marcado ? "Evento marcado ✓" : "Marcar evento"}
              </button>

              <p className="mt-2 text-center text-[11px] leading-relaxed text-stone-500">
                Marcar indica sua intenção de participar. Isso não confirma presença nem adiciona o evento ao histórico.
              </p>

              {marcado && (
                <p role="status" className="mt-2 text-center text-xs font-semibold text-emerald-700">
                  Sua intenção foi salva neste dispositivo.
                </p>
              )}
            </section>

            {/* Recomendações */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-card text-xl font-bold text-stone-900">
                Recomendações
              </h2>

              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">
                {detalhes.recomendacoes.map((recomendacao, indice) => (
                  <li key={indice} className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 font-bold text-mare-laranja">
                      •
                    </span>
                    <span>{recomendacao}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Localização enquanto o mapa/API não está integrado */}
            <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <h2 className="font-card text-lg font-bold">Local do evento</h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-stone-700">
                <IconePino size={17} className="mt-0.5 shrink-0 text-mare-laranja" />
                <span>
                  {evento.local}, {evento.cidade}
                </span>
              </p>
              <Link
                href={`/mapa?evento=${evento.id}`}
                className="mt-4 inline-flex rounded-full bg-mare-laranja px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
              >
                Ver no mapa
              </Link>
            </section>
          </aside>
        </div>
      </main>

      {/* Navegação inferior mobile */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {abas.map(({ href, label, Icone }) => {
            const ativo = label === "Explorar";

            return (
              <li key={label} className="flex-1">
                <Link
                  href={href}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                    ativo ? "font-bold text-mare-laranja" : "text-stone-400"
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
