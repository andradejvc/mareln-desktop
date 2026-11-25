
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  listarEventos,
  type EventoExplorar,
} from "@/lib/eventos-api";

import { useFavoritos } from "@/lib/favoritos";
import { useSessao } from "@/lib/usuario";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import CabecalhoMobile from "@/components/explorar/CabecalhoMobile";

import {
  BotaoFavorito,
  LinkDetalhesEvento,
} from "@/components/dashboard/partes";

import {
  IconeBusca,
  IconeCoracao,
  IconeInicio,
  IconeSeta,
  IconeUsuario,
} from "@/components/dashboard/icons";

const QUANTIDADE_INICIAL = 9;

const abas = [
  { href: "/dashboard", label: "Início", Icone: IconeInicio },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca },
  { href: "/mapa", label: "Mapa", Icone: IconeSeta },
  { href: "/favoritos", label: "Favoritos", Icone: IconeCoracao },
  { href: "/perfil", label: "Perfil", Icone: IconeUsuario },
];

export default function FavoritosView() {
  const { usuario } = useSessao();

  const {
    favoritos,
    alternarFavorito,
    carregandoFavoritos,
    erroFavoritos,
  } = useFavoritos();

  const [eventos, setEventos] = useState<EventoExplorar[]>([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [erroEventos, setErroEventos] = useState<string | null>(null);

  const [quantidadeVisivel, setQuantidadeVisivel] =
    useState(QUANTIDADE_INICIAL);

  // Busca os eventos publicados no backend.
  useEffect(() => {
    let ativo = true;

    async function carregarEventos() {
      setCarregandoEventos(true);
      setErroEventos(null);

      try {
        const resposta = await listarEventos();

        if (ativo) {
          setEventos(resposta);
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

  // Cruza os eventos publicados com os IDs favoritos da conta.
  const meusFavoritos = eventos.filter((evento) =>
    favoritos.includes(evento.id),
  );

  const eventosVisiveis = meusFavoritos.slice(0, quantidadeVisivel);

  const carregando = carregandoEventos || carregandoFavoritos;
  const erro = erroEventos ?? erroFavoritos;

  return (
    <div className="mx-auto w-full max-w-xl pb-24 lg:max-w-7xl lg:px-6 lg:py-5">
      <div className="lg:hidden">
        <CabecalhoMobile sessao="logado" paginaAtiva="Favoritos" />
      </div>

      <div className="hidden lg:block">
        <DashboardNavbar
          nomeUsuario={usuario?.nome ?? ""}
          totalFavoritos={favoritos.length}
          paginaAtiva="Favoritos"
        />
      </div>

      <main className="px-5 pb-8 pt-8 lg:mt-14 lg:px-0 lg:pt-0">
        <header className="mb-7">
          <h1 className="font-titulo text-2xl uppercase tracking-wide text-mare-rosa lg:text-3xl">
            Meus favoritos
          </h1>

          <p className="mt-2 text-xs text-stone-600 lg:text-sm">
            Eventos que você salvou para não perder.
          </p>
        </header>

        {carregando ? (
          <section
            role="status"
            className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm"
          >
            <p className="font-semibold text-stone-700">
              Carregando seus favoritos...
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Buscando seus eventos salvos.
            </p>
          </section>
        ) : erro ? (
          <section
            role="alert"
            className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-50">
              <IconeCoracao size={30} className="text-mare-rosa" />
            </div>

            <h2 className="font-titulo mt-5 text-xl">
              Não foi possível carregar seus favoritos
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-mare-laranja px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Tentar novamente
            </button>
          </section>
        ) : meusFavoritos.length === 0 ? (
          <section className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-50">
              <IconeCoracao size={30} className="text-mare-rosa" />
            </div>

            <h2 className="font-titulo mt-5 text-xl">
              Nenhum favorito por enquanto
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">
              Explore os eventos do Litoral Norte e toque no coração para
              salvar aqueles que você não quer perder.
            </p>

            <Link
              href="/explorar"
              className="mt-6 inline-flex rounded-xl bg-mare-laranja px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Explorar eventos
            </Link>
          </section>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {eventosVisiveis.map((evento) => (
                <li
                  key={evento.id}
                  className="cartao-evento relative flex min-h-36 items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-md shadow-orange-900/10 lg:min-h-0 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:rounded-[20px] lg:p-0 lg:shadow-sm"
                >
                  <div className="relative h-24 w-[34%] shrink-0 overflow-hidden rounded-xl lg:h-40 lg:w-full lg:rounded-none">
                    <Image
                      src={evento.imagem}
                      alt={evento.titulo}
                      fill
                      sizes="(min-width: 1024px) 33vw, 123px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 py-1 pr-7 lg:p-4 lg:pr-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-mare-rosa">
                      {evento.categoria}
                    </p>

                    <h2 className="font-card mt-1 line-clamp-2 text-base font-bold leading-tight lg:text-lg">
                      {evento.titulo}
                    </h2>

                    <p className="mt-2 text-[11px] text-stone-500 lg:text-xs">
                      {evento.data} • {evento.hora}
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-stone-500 lg:text-xs">
                      {evento.cidade
                        ? `${evento.local}, ${evento.cidade}`
                        : evento.local}
                    </p>
                  </div>

                  <BotaoFavorito
                    evento={evento}
                    ativo
                    onAlternar={alternarFavorito}
                    className="absolute right-3 top-3 shadow-sm"
                  />

                  <LinkDetalhesEvento evento={evento} />
                </li>
              ))}
            </ul>

            {meusFavoritos.length > quantidadeVisivel && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setQuantidadeVisivel(
                      (atual) => atual + QUANTIDADE_INICIAL,
                    )
                  }
                  className="w-full max-w-sm rounded-2xl bg-mare-laranja px-8 py-3.5 font-titulo text-lg text-white shadow-md shadow-orange-900/20 transition hover:scale-[1.01] hover:opacity-95"
                >
                  Ver mais
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {abas.map(({ href, label, Icone }) => {
            const ativo = label === "Favoritos";

            return (
              <li key={label} className="flex-1">
                <Link
                  href={href}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                    ativo
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
