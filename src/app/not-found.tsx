
"use client";

import Link from "next/link";
import { useSessao } from "@/lib/usuario";

export default function NotFound() {
  const { usuario, pronta } = useSessao();

  const destino = usuario ? "/dashboard" : "/";

  return (
    <main className="flex min-h-screen flex-col bg-mare-creme">
      {/* Topo laranja com borda ondulada */}
      <div className="relative h-24 shrink-0 bg-mare-laranja md:h-32">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-8"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 100%, #FFF8F1 31px, transparent 32px)",
            backgroundSize: "64px 32px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center bottom",
          }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col items-center pt-16 text-center sm:pt-20 md:pt-24">
        <div className="px-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-mare-rosa">
            Ops! Página perdida
          </p>

          <h1 className="font-titulo text-[8rem] font-extrabold leading-none tracking-tight text-mare-laranja sm:text-[10rem] md:text-[12rem]">
            404
          </h1>

          <p className="mx-auto mt-3 max-w-md px-4 text-sm leading-relaxed text-stone-500 sm:text-base">
            Parece que a maré levou essa página para longe.
            Que tal voltar e continuar explorando?
          </p>
        </div>

        {/* Faixa original */}
        <div className="mt-10 w-full">
          <div className="bg-mare-laranja px-5 py-3">
            <h2 className="font-titulo text-lg font-bold uppercase tracking-wide text-white sm:text-xl md:text-2xl">
              Página não encontrada
            </h2>
          </div>
          <div className="mt-1 h-1 bg-mare-laranja" />
        </div>

        {/* Botão de retorno */}
        <div className="mt-12 px-5 sm:mt-14">
          {pronta ? (
            <Link
              href={destino}
              className="font-titulo inline-flex min-w-56 items-center justify-center rounded-xl bg-mare-laranja px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-mare-rosa hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mare-laranja"
            >
              {usuario ? "Voltar ao dashboard" : "Voltar para o início"}
            </Link>
          ) : (
            <span className="font-titulo inline-flex min-w-56 items-center justify-center rounded-xl bg-mare-laranja/50 px-8 py-3.5 text-sm font-bold uppercase text-white">
              Carregando...
            </span>
          )}
        </div>
      </div>

      {/* Rodapé discreto */}
      <footer className="px-4 py-6 text-center text-xs text-stone-400">
        Maré LN — Explore o Litoral Norte
      </footer>
    </main>
  );
}
