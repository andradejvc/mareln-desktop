
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconeBusca,
  IconeCoracao,
  IconeInicio,
  IconeSeta,
  IconeUsuario,
} from "../dashboard/icons";

type Props = {
  sessao?: "carregando" | "visitante" | "logado";
};

type ItemMenu = {
  href: string;
  label: string;
  Icone: typeof IconeInicio;
  ativo?: boolean;
};

const menuLogado: ItemMenu[] = [
  { href: "/dashboard", label: "Início", Icone: IconeInicio },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca, ativo: true },
  { href: "/explorar", label: "Mapa", Icone: IconeSeta },
  {
    href: "/dashboard#favoritos-mobile",
    label: "Favoritos",
    Icone: IconeCoracao,
  },
  { href: "/perfil", label: "Perfil", Icone: IconeUsuario },
];

const menuVisitante: ItemMenu[] = [
  { href: "/", label: "Início", Icone: IconeInicio },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca, ativo: true },
  { href: "/explorar", label: "Mapa", Icone: IconeSeta },
];

export default function CabecalhoMobile({
  sessao = "logado",
}: Props) {
  const [aberto, setAberto] = useState(false);

  const logado = sessao === "logado";
  const menu = logado ? menuLogado : menuVisitante;

  return (
    <header
      className={`relative bg-mare-laranja px-5 py-4 text-white shadow-md lg:hidden ${
        sessao === "carregando" ? "invisible" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        {logado ? (
          <Link
            href="/dashboard"
            className="font-titulo text-lg font-bold text-white"
          >
            Maré LN
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-mare-laranja"
          >
            Entrar
          </Link>
        )}

        <button
          type="button"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="menu-explorar"
          onClick={() => setAberto((v) => !v)}
          className="grid size-11 place-items-center rounded-full"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {aberto ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {aberto && (
        <nav
          id="menu-explorar"
          aria-label="Principal"
          className="absolute right-5 top-[calc(100%+0.5rem)] z-40 w-56 rounded-2xl bg-white p-2 text-stone-800 shadow-xl"
        >
          <ul>
            {menu.map(({ href, label, Icone, ativo }) => (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={ativo ? "page" : undefined}
                  onClick={() => setAberto(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    ativo
                      ? "bg-mare-laranja/10 font-bold text-mare-laranja"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <Icone size={18} />
                  {label}
                </Link>
              </li>
            ))}

            {!logado && (
              <li className="mt-1 space-y-2 border-t border-stone-100 p-2 pt-3">
                <Link
                  href="/login"
                  onClick={() => setAberto(false)}
                  className="block rounded-full border-2 border-mare-laranja py-2 text-center text-sm font-bold text-mare-laranja"
                >
                  Entrar
                </Link>

                <Link
                  href="/registro"
                  onClick={() => setAberto(false)}
                  className="block rounded-full bg-mare-laranja py-2 text-center text-sm font-bold text-white"
                >
                  Criar conta
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
