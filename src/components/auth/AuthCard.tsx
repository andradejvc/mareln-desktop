import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import SeagullsBg from "./SeagullsBg";

type AuthCardProps = {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
};

export default function AuthCard({ titulo, subtitulo, children }: AuthCardProps) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-mare-creme px-4 pb-8 pt-20 md:py-12">
      {/* Mobile: fundo de gaivotas */}
      <div className="md:hidden">
        <SeagullsBg />
      </div>

      {/* Desktop (md+): terceira imagem, meio opaca, para destacar o card */}
      <div aria-hidden className="absolute inset-0 hidden md:block">
        <Image
          src="/image/praia-fundo-login.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-mare-creme/50" />
      </div>

      {/* Botão voltar para a home (fora do card) */}
      <Link
        href="/"
        aria-label="Voltar para a página inicial"
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-mare-laranja shadow-md ring-1 ring-mare-laranja/20 transition hover:bg-mare-laranja hover:text-white md:left-8 md:top-6"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      {/* Cartão arredondado em destaque */}
      <section className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white px-6 py-8 shadow-2xl ring-1 ring-mare-laranja/10 sm:px-8 md:max-w-md md:rounded-[2.5rem] md:px-10 md:py-10">
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mare-laranja/25 md:h-24 md:w-24">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-mare-laranja"
            aria-hidden
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
          </svg>
        </div>

        <h1 className="font-titulo mt-4 text-center text-xl font-bold text-mare-laranja underline underline-offset-4 md:text-2xl">
          {titulo}
        </h1>
        <p className="font-titulo mt-2 max-w-xs text-center text-xs font-bold text-mare-laranja md:text-sm">
          {subtitulo}
        </p>

        <div className="mt-6 w-full">{children}</div>
      </section>
    </main>
  );
}