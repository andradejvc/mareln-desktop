"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cidades, type Cidade } from "@/data/eventos";
import {
  dataDeHoje,
  eventosDashboard,
  favoritosIniciais,
  sugestoesIds,
  usuario,
  type CategoriaDashboard,
  type EventoDashboard,
} from "@/data/dashboard";
import DashboardNavbar from "./DashboardNavbar";
import { IconeCalendario, IconeCoracao, IconePino, IconeSeta } from "./icons";

const corDaCategoria: Record<CategoriaDashboard, string> = {
  Música: "bg-rose-100 text-rose-700",
  Feiras: "bg-amber-100 text-amber-700",
  Natureza: "bg-green-100 text-green-700",
  Esportes: "bg-blue-100 text-blue-700",
  Cultura: "bg-purple-100 text-purple-700",
  Gastronomia: "bg-emerald-100 text-emerald-700",
};

function Chip({ categoria }: { categoria: CategoriaDashboard }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${corDaCategoria[categoria]}`}
    >
      {categoria}
    </span>
  );
}

function BotaoFavorito({
  evento,
  ativo,
  onAlternar,
  escuro = false,
  className = "",
}: {
  evento: EventoDashboard;
  ativo: boolean;
  onAlternar: (id: number) => void;
  escuro?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={`${ativo ? "Remover dos" : "Adicionar aos"} favoritos: ${evento.titulo}`}
      onClick={() => onAlternar(evento.id)}
      className={`grid size-8 place-items-center rounded-full backdrop-blur transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-mare-rosa ${
        escuro
          ? `bg-black/40 ${ativo ? "text-mare-rosa" : "text-white"}`
          : `bg-white/90 ${ativo ? "text-mare-rosa" : "text-stone-700"}`
      } ${className}`}
    >
      <IconeCoracao size={16} ativo={ativo} />
    </button>
  );
}

function Miniatura({
  evento,
  tamanho = "size-10",
}: {
  evento: EventoDashboard;
  tamanho?: string;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg ${tamanho}`}>
      <Image src={evento.imagem} alt="" fill sizes="48px" className="object-cover" />
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
  acao?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl bg-white p-5 shadow-sm shadow-orange-900/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">{titulo}</h2>
        {acao && (
          <Link href={acao.href} className="text-xs font-medium text-mare-rosa hover:underline">
            {acao.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function DashboardView() {
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>(favoritosIniciais);

  function alternarFavorito(id: number) {
    setFavoritos((atual) =>
      atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id],
    );
  }

  const hoje = eventosDashboard.filter((e) => e.hoje);
  const [destaque, ...outrosHoje] = hoje;
  const proximos = eventosDashboard.filter(
    (e) => !e.hoje && (!cidade || e.cidade === cidade),
  );
  const meusFavoritos = eventosDashboard.filter((e) => favoritos.includes(e.id));
  const sugestoes = eventosDashboard.filter((e) => sugestoesIds.includes(e.id));
  const contagem = (c: Cidade) =>
    eventosDashboard.filter((e) => e.cidade === c).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
      <DashboardNavbar
        nomeUsuario={usuario.nome}
        totalFavoritos={favoritos.length}
        notificacoes={3}
      />

      {/* Saudação */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {dataDeHoje}
          </p>
          <h1 className="font-titulo mt-1 text-3xl font-bold sm:text-4xl">
            Oi, {usuario.nome}!
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            O que vamos descobrir hoje no litoral?
          </p>
        </div>
        <Link
          href="/explorar"
          className="rounded-lg border-2 border-mare-laranja px-4 py-2 text-sm font-semibold text-mare-laranja transition-colors hover:bg-mare-laranja hover:text-white"
        >
          Ver todos os eventos →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Coluna principal */}
        <div className="space-y-10">
          {/* Acontecendo hoje */}
          {destaque && (
            <section aria-labelledby="titulo-hoje">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="titulo-hoje" className="text-xl font-bold">
                  Acontecendo hoje
                </h2>
                <span className="rounded-full bg-mare-rosa/15 px-3 py-1 text-xs font-semibold text-mare-rosa">
                  {hoje.length} {hoje.length === 1 ? "evento" : "eventos"}
                </span>
              </div>

              <article className="relative h-64 overflow-hidden rounded-2xl sm:h-80 lg:h-[330px]">
                <Image
                  src={destaque.imagem}
                  alt={destaque.titulo}
                  fill
                  priority
                  sizes="(min-width: 1024px) 700px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
                <span className="absolute left-4 top-4 rounded-md bg-mare-rosa px-3 py-1 text-xs font-bold text-white">
                  HOJE • {destaque.hora}
                </span>
                <BotaoFavorito
                  evento={destaque}
                  ativo={favoritos.includes(destaque.id)}
                  onAlternar={alternarFavorito}
                  escuro
                  className="absolute right-4 top-4"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <Chip categoria={destaque.categoria} />
                  <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                    {destaque.titulo}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                    <IconePino size={14} />
                    {destaque.local}, {destaque.cidade}
                  </p>
                </div>
              </article>

              {outrosHoje.map((e) => (
                <article
                  key={e.id}
                  className="mt-3 flex max-w-md overflow-hidden rounded-xl bg-white shadow-sm shadow-orange-900/5"
                >
                  <div className="relative w-24 shrink-0">
                    <Image src={e.imagem} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <Chip categoria={e.categoria} />
                    <h3 className="mt-1.5 text-sm font-bold">{e.titulo}</h3>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {e.hora} • {e.cidade}
                    </p>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Próximos eventos */}
          <section aria-labelledby="titulo-proximos">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="titulo-proximos" className="text-xl font-bold">
                Próximos eventos
                {cidade && (
                  <span className="ml-2 text-sm font-normal text-stone-500">
                    em {cidade}
                  </span>
                )}
              </h2>
              <Link href="/explorar" className="text-sm font-medium text-mare-laranja hover:underline">
                Ver todos →
              </Link>
            </div>

            {proximos.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
                Nenhum evento próximo nessa cidade por enquanto.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {proximos.map((e) => (
                  <article
                    key={e.id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm shadow-orange-900/5 transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-36">
                      <Image
                        src={e.imagem}
                        alt={e.titulo}
                        fill
                        sizes="(min-width: 1280px) 220px, (min-width: 640px) 45vw, 100vw"
                        className="object-cover"
                      />
                      <BotaoFavorito
                        evento={e}
                        ativo={favoritos.includes(e.id)}
                        onAlternar={alternarFavorito}
                        className="absolute right-2.5 top-2.5"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <Chip categoria={e.categoria} />
                      <h3 className="text-sm font-bold leading-snug">{e.titulo}</h3>
                      <p className="flex items-center gap-1.5 text-xs text-stone-500">
                        <IconeCalendario size={13} />
                        {e.data} às {e.hora}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-stone-500">
                        <IconePino size={13} />
                        {e.cidade}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <CardSidebar titulo="Filtrar por cidade">
            <ul className="space-y-1">
              {cidades.map((c) => {
                const ativa = cidade === c;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      aria-pressed={ativa}
                      onClick={() => setCidade(ativa ? null : c)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors ${
                        ativa
                          ? "bg-mare-laranja/10 font-semibold text-mare-laranja"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <IconePino size={14} className="text-stone-400" />
                        {c}
                      </span>
                      <span className="grid size-6 place-items-center rounded-full bg-stone-100 text-xs font-medium text-stone-600">
                        {contagem(c)}
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
            acao={{ href: "#favoritos", label: "Ver todos" }}
          >
            {meusFavoritos.length === 0 ? (
              <p className="text-xs text-stone-500">
                Toque no coração de um evento para guardá-lo aqui.
              </p>
            ) : (
              <ul className="space-y-3">
                {meusFavoritos.map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <Miniatura evento={e} tamanho="size-11" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{e.titulo}</p>
                      <p className="text-xs text-stone-400">
                        {e.data} • {e.cidade}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remover dos favoritos: ${e.titulo}`}
                      onClick={() => alternarFavorito(e.id)}
                      className="text-mare-rosa"
                    >
                      <IconeCoracao size={16} ativo />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardSidebar>

          <CardSidebar titulo="Pode te interessar">
            <ul className="space-y-3">
              {sugestoes.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <Miniatura evento={e} tamanho="size-11" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{e.titulo}</p>
                    <p className="text-xs text-stone-400">
                      {e.categoria} • {e.cidade}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardSidebar>

          <Link
            href="/explorar"
            className="relative flex h-28 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-mare-laranja text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.01]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_30%,#fff_0,transparent_35%),radial-gradient(circle_at_80%_70%,#7c2d12_0,transparent_40%)]"
            />
            <IconeSeta size={18} className="relative" />
            <span className="relative">Ver mapa interativo</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}