
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  categorias,
  type Categoria,
  type Cidade,
} from "@/data/eventos";

import {
  listarEventos,
  type EventoExplorar,
} from "@/lib/eventos-api";

import { useSessao } from "@/lib/usuario";
import { useFavoritos } from "@/lib/favoritos";

import DashboardNavbar from "../dashboard/DashboardNavbar";
import { IconeBusca, IconePino } from "../dashboard/icons";
import {
  BotaoFavorito,
  LinkDetalhesEvento,
} from "../dashboard/partes";

import CabecalhoMobile from "./CabecalhoMobile";
import FiltroCidades from "./FiltroCidades";

function combina(
  evento: EventoExplorar,
  busca: string,
  cidade: Cidade | null,
  categoria: Categoria | null,
) {
  if (cidade && evento.cidade !== cidade) return false;
  if (categoria && evento.categoria !== categoria) return false;

  const termo = busca.trim().toLowerCase();

  if (!termo) return true;

  return [
    evento.titulo,
    evento.local,
    evento.cidade ?? "",
    evento.categoria,
  ].some((campo) => campo.toLowerCase().includes(termo));
}

export default function ExplorarView() {
  const router = useRouter();

  const { usuario, pronta } = useSessao();

  const sessao = !pronta
    ? "carregando"
    : usuario
      ? "logado"
      : "visitante";

  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [eventos, setEventos] = useState<EventoExplorar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(
    null,
  );
  const [tentativa, setTentativa] = useState(0);

  const {
    favoritos,
    alternarFavorito: alternarFavoritoSalvo,
  } = useFavoritos();

  // Busca os eventos reais do backend.
  useEffect(() => {
    let ativo = true;

    async function carregarEventos() {
      setCarregando(true);
      setErroCarregamento(null);

      try {
        const resposta = await listarEventos();

        if (ativo) {
          setEventos(resposta);
        }
      } catch (erro) {
        if (ativo) {
          setErroCarregamento(
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
  }, [tentativa]);

  // Mantém os filtros existentes.
  const filtrados = useMemo(
    () =>
      eventos.filter((evento) =>
        combina(evento, busca, cidade, categoria),
      ),
    [eventos, busca, cidade, categoria],
  );

  const favoritosVisiveis =
    sessao === "logado" ? favoritos : [];

  function alternarFavorito(id: number) {
    if (sessao === "visitante") {
      router.push("/login?returnTo=/explorar");
      return;
    }

    if (sessao !== "logado") return;

    alternarFavoritoSalvo(id);
  }

  function limparFiltros() {
    setBusca("");
    setCidade(null);
    setCategoria(null);
  }

  function alternarFiltros() {
    setFiltrosAbertos((atual) => !atual);
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-10 lg:max-w-7xl lg:px-6 lg:py-5">
      <CabecalhoMobile sessao={sessao} />

      <div className="hidden lg:block">
        <DashboardNavbar
          sessao={sessao}
          nomeUsuario={usuario?.nome}
          totalFavoritos={favoritosVisiveis.length}
          paginaAtiva="Explorar"
          busca={busca}
          onBusca={setBusca}
        />
      </div>

      <main className="px-5 pt-5 lg:mt-10 lg:px-0 lg:pt-0">
        <h1 className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Voltar para o início"
            className="text-stone-800 lg:hidden"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12H5M11 6l-6 6 6 6" />
            </svg>
          </Link>

          <span className="font-titulo text-2xl uppercase tracking-wide text-mare-rosa lg:text-3xl">
            Explorar
          </span>
        </h1>

        <div className="lg:hidden">
          <div className="mt-4 flex items-center gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-stone-400 shadow-sm">
              <IconeBusca size={16} />
              <span className="sr-only">Buscar eventos</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
              />
            </label>

            <button
              type="button"
              aria-label="Filtrar por categoria"
              aria-expanded={filtrosAbertos}
              aria-controls="filtros-categorias"
              onClick={alternarFiltros}
              className={`grid size-10 shrink-0 place-items-center rounded-full text-mare-rosa ${
                filtrosAbertos || categoria ? "bg-mare-rosa/15" : ""
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h9M19 6h1M4 12h3M13 12h7M4 18h11M21 18h-1" />
                <circle cx="16" cy="6" r="2" />
                <circle cx="10" cy="12" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 hidden items-center justify-between lg:flex">
          <h2 className="text-base font-bold">
            Filtrar por categoria
          </h2>

          <button
            type="button"
            aria-expanded={filtrosAbertos}
            aria-controls="filtros-categorias"
            onClick={alternarFiltros}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold transition-colors ${
              filtrosAbertos || categoria
                ? "border-mare-rosa bg-mare-rosa/10 text-mare-rosa"
                : "border-stone-200 bg-white text-stone-600 hover:border-mare-rosa hover:text-mare-rosa"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h9M19 6h1M4 12h3M13 12h7M4 18h11M21 18h-1" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="10" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            {categoria ?? "Selecionar categoria"}
          </button>
        </div>

        {filtrosAbertos && (
          <div
            id="filtros-categorias"
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Categorias"
          >
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={categoria === c}
                onClick={() =>
                  setCategoria(categoria === c ? null : c)
                }
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  categoria === c
                    ? "border-mare-rosa bg-mare-rosa text-white"
                    : "border-mare-rosa/40 bg-white text-mare-rosa hover:bg-mare-rosa/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <section aria-labelledby="titulo-cidades" className="mt-6">
          <h2
            id="titulo-cidades"
            className="mb-3 text-base font-bold lg:text-sm"
          >
            Cidades
          </h2>

          <FiltroCidades
            selecionada={cidade}
            onSelecionar={setCidade}
          />
        </section>

        <section aria-labelledby="titulo-eventos" className="mt-8">
          <h2
            id="titulo-eventos"
            className="mb-3 text-base font-bold lg:sr-only"
          >
            {cidade ? `Eventos em ${cidade}` : "Próximos eventos"}
          </h2>

          {carregando ? (
            <div
              role="status"
              className="rounded-2xl bg-white p-8 text-center shadow-sm"
            >
              <p className="font-semibold text-stone-700">
                Carregando eventos...
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Buscando eventos no Maré LN.
              </p>
            </div>
          ) : erroCarregamento ? (
            <div
              role="alert"
              className="rounded-2xl bg-white p-8 text-center shadow-sm"
            >
              <p className="font-bold text-stone-800">
                Não foi possível carregar os eventos.
              </p>
              <p className="mt-2 text-sm text-stone-500">
                {erroCarregamento}
              </p>
              <button
                type="button"
                onClick={() => setTentativa((atual) => atual + 1)}
                className="mt-4 rounded-full bg-mare-rosa px-5 py-2 text-sm font-bold text-white"
              >
                Tentar novamente
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="font-bold">
                Nenhum evento encontrado.
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Tente outra busca ou limpe os filtros.
              </p>
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-4 rounded-full bg-mare-rosa px-5 py-2 text-sm font-bold text-white"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <ul className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
              {filtrados.map((e) => (
                <li
                  key={e.id}
                  className="cartao-evento relative flex gap-3 rounded-2xl bg-white p-3 shadow-md shadow-orange-900/10 lg:flex-col lg:gap-0 lg:overflow-hidden lg:p-0 lg:transition-shadow lg:hover:shadow-lg lg:hover:shadow-orange-900/10"
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl lg:h-44 lg:w-full lg:rounded-none">
                    <Image
                      src={e.imagem}
                      alt={e.titulo}
                      fill
                      sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 112px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center pr-8 lg:justify-start lg:p-4 lg:pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-mare-rosa lg:hidden">
                      {e.categoria}
                    </span>

                    <h3 className="font-card text-base leading-tight">
                      {e.titulo}
                    </h3>

                    <p className="mt-1 text-[11px] text-stone-500 lg:text-sm lg:text-stone-600">
                      {e.data} • {e.hora}
                    </p>

                    <p className="flex items-center gap-1.5 text-[11px] text-stone-500 lg:mt-1 lg:text-xs lg:text-stone-700">
                      <span className="hidden lg:inline">
                        <IconePino size={13} />
                      </span>
                      {e.cidade
                        ? `${e.local}, ${e.cidade}`
                        : e.local}
                    </p>
                  </div>

                  <BotaoFavorito
                    evento={e}
                    ativo={favoritosVisiveis.includes(e.id)}
                    onAlternar={alternarFavorito}
                    className="absolute right-3 top-3 shadow"
                  />

                  <LinkDetalhesEvento evento={e} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10 hidden justify-center lg:flex">
          <Link
            href="/mapa"
            className="rounded-xl bg-mare-laranja px-12 py-3 font-titulo text-lg text-white shadow-md shadow-orange-900/20 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mare-laranja"
          >
            Ver mais no mapa
          </Link>
        </div>
      </main>
    </div>
  );
}
