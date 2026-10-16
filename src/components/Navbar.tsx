"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const links = [
  { texto: "Início", href: "/" },
  { texto: "Eventos", href: "/explorar" },
  { texto: "Sobre", href: "/#sobre" },
  { texto: "Contato", href: "/#contato" },
];

export default function Navbar() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  function handleNavigation(
    event: React.MouseEvent<HTMLAnchorElement>,
    texto: string,
    href: string
  ) {
    if (texto !== "Eventos") {
      return;
    }

    event.preventDefault();

    const isLogged = localStorage.getItem("isLogged") === "true";

    if (isLogged) {
      router.push(href);
    } else {
      router.push("/login");
    }

    setAberto(false);
  }

  return (
    <header className="relative z-30 bg-mare-laranja">
      <div className="flex items-center justify-between px-5 md:px-20">
        <Link
          href="/"
          aria-label="Ir para o início"
          onClick={() => setAberto(false)}
        >
          <Image
            src="/image/logo.png"
            alt="Maré LN"
            width={100}
            height={100}
          />
        </Link>

        {/* Desktop */}
        <nav className="hidden gap-8 text-white md:flex">
          {links.map((link) => (
            <Link
              key={link.texto}
              href={link.href}
              onClick={(event) =>
                handleNavigation(event, link.texto, link.href)
              }
            >
              {link.texto}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="hidden rounded-full bg-white px-6 py-2 font-titulo text-sm font-bold text-mare-laranja md:block"
        >
          Acessar
        </Link>

        {/* Mobile */}
        <button
          className="text-white md:hidden"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          onClick={() => setAberto(!aberto)}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {aberto ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {aberto && (
        <nav className="absolute left-0 top-full flex w-full flex-col items-center gap-5 bg-mare-laranja px-5 pb-6 pt-2 text-center text-lg text-white shadow-lg md:hidden">
          {links.map((link) => (
            <Link
              key={link.texto}
              href={link.href}
              onClick={(event) =>
                handleNavigation(event, link.texto, link.href)
              }
            >
              {link.texto}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setAberto(false)}
            className="w-full max-w-xs rounded-xl bg-white py-3 font-titulo font-bold text-mare-laranja"
          >
            Acessar
          </Link>
        </nav>
      )}
    </header>
  );
}