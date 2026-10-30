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
  type EventoDashboard,
} from "@/data/dashboard";
import DashboardMobile from "./DashboardMobile";
import DashboardNavbar from "./DashboardNavbar";
import { IconeCalendario, IconeCoracao, IconePino } from "./icons";
import { BannerMapa, BotaoFavorito, Chip } from "./partes";

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
        <h2 className="font-titulo text-xl">{titulo}</h2>
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
    <>
      {/* ================= MOBILE (abaixo de 1024px) ================= */}
      <div className="lg:hidden">
        <DashboardMobile
          nomeUsuario={usuario.nome}
          notificacoes={3}
          cidade={cidade}
          onCidade={setCidade}
          favoritos={favoritos}
          onFavorito={alternarFavorito}
          hoje={hoje}
          sugestoes={sugestoes}
          meusFavoritos={meusFavoritos}
          proximos={proximos}
        />
      </div>

      {/* ================= DESKTOP (1024px ou mais) ================= */}
      <div className="mx-auto hidden w-full max-w-7xl px-6 py-5 lg:block">
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
            <h1 className="font-titulo mt-1 text-4xl xl:text-5xl">
              Oi, {usuario.nome}!
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              O que vamos descobrir hoje no litoral?
            </p>
          </div>
          <Link
            href="/explorar"
            className="rounded-xl border-2 border-mare-laranja px-5 py-2.5 text-sm font-bold text-mare-laranja transition-colors hover:bg-mare-laranja hover:text-white"
          >
            Ver todos os eventos →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_340px] gap-6">
          {/* Coluna principal */}
          <div className="space-y-10">
            {/* Acontecendo hoje */}
            {destaque && (
              <section aria-labelledby="titulo-hoje">
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="titulo-hoje" className="font-titulo text-2xl">
                    Acontecendo hoje
                  </h2>
                  <span className="rounded-full bg-mare-rosa/15 px-3 py-1 text-xs font-bold text-mare-rosa">
                    {hoje.length} {hoje.length === 1 ? "evento" : "eventos"}
                  </span>
                </div>

                <article className="relative h-64 overflow-hidden rounded-3xl">
                  <Image
                    src={destaque.imagem}
                    alt={destaque.titulo}
                    fill
                    sizes="(min-width: 1280px) 800px, 640px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-black/30" />
                  <span className="absolute left-4 top-4 rounded-full bg-mare-rosa px-3.5 py-1 text-xs font-bold text-white">
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
                    <h3 className="mt-2 text-3xl font-bold">{destaque.titulo}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                      <IconePino size={14} />
                      {destaque.local}, {destaque.cidade}
                    </p>
                  </div>
                </article>

                {outrosHoje.map((e) => (
                  <article
                    key={e.id}
                    className="mt-3 flex max-w-sm overflow-hidden rounded-xl bg-white shadow-sm shadow-orange-900/5"
                  >
                    <div className="relative w-20 shrink-0">
                      <Image src={e.imagem} alt="" fill sizes="80px" className="object-cover" />
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
                <h2 id="titulo-proximos" className="font-titulo text-2xl">
                  Próximos eventos
                  {cidade && (
                    <span className="ml-2 font-sans text-sm text-stone-500">
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
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                  {proximos.map((e) => (
                    <article
                      key={e.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-orange-900/5 transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-32">
                        <Image
                          src={e.imagem}
                          alt={e.titulo}
                          fill
                          sizes="(min-width: 1280px) 280px, 300px"
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
                            ? "bg-mare-laranja/10 font-bold text-mare-laranja"
                            : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <IconePino size={14} className="text-stone-400" />
                          {c}
                        </span>
                        <span className="grid size-6 place-items-center rounded-full bg-stone-100 text-xs text-stone-600">
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

            <BannerMapa className="h-28" />
          </aside>
        </div>
      </div>
    </>
  );
}
