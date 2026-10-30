"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconeBusca,
  IconeCoracao,
  IconeInicio,
  IconeSeta,
  IconeSino,
  IconeUsuario,
} from "../dashboard/icons";

const menu = [
  { href: "/dashboard", label: "Início", Icone: IconeInicio },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca, ativo: true },
  { href: "/explorar", label: "Mapa", Icone: IconeSeta },
  { href: "/dashboard#favoritos-mobile", label: "Favoritos", Icone: IconeCoracao },
  { href: "/login", label: "Perfil", Icone: IconeUsuario },
];

// Faixa laranja do celular (sino + menu). No desktop quem aparece é a DashboardNavbar.
export default function CabecalhoMobile({ notificacoes }: { notificacoes: number }) {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="relative bg-mare-laranja px-5 py-4 text-white shadow-md lg:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={`Notificações${notificacoes ? ` (${notificacoes} novas)` : ""}`}
          className="relative grid size-11 place-items-center rounded-full bg-white/20"
        >
          <IconeSino size={20} />
          {notificacoes > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-mare-rosa text-[10px] font-bold">
              {notificacoes}
            </span>
          )}
        </button>

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
            {aberto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
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
                    ativo ? "bg-mare-laranja/10 font-bold text-mare-laranja" : "hover:bg-stone-50"
                  }`}
                >
                  <Icone size={18} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}