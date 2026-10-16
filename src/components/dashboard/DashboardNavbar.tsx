import Link from "next/link";
import {
  IconeBusca,
  IconeCoracao,
  IconeInicio,
  IconeSeta,
  IconeSino,
  IconeUsuario,
} from "./icons";

type Props = {
  nomeUsuario: string;
  totalFavoritos: number;
  notificacoes?: number;
};

const links = [
  { href: "/dashboard", label: "Início", Icone: IconeInicio, ativo: true },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca },
  { href: "/explorar", label: "Mapa", Icone: IconeSeta },
  { href: "#favoritos", label: "Favoritos", Icone: IconeCoracao, favoritos: true },
  { href: "/login", label: "Perfil", Icone: IconeUsuario },
];

export default function DashboardNavbar({
  nomeUsuario,
  totalFavoritos,
  notificacoes = 0,
}: Props) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-md shadow-orange-900/5 sm:px-4">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
        <span className="font-titulo grid size-9 place-items-center rounded-xl bg-mare-laranja text-lg font-extrabold text-white">
          M
        </span>
        <span className="font-titulo hidden text-lg font-bold text-mare-laranja sm:inline">
          Maré LN
        </span>
      </Link>

      <nav
        aria-label="Principal"
        className="flex items-center gap-1 rounded-xl bg-stone-100 p-1"
      >
        {links.map(({ href, label, Icone, ativo, favoritos }) => (
          <Link
            key={label}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors sm:px-3 ${
              ativo
                ? "bg-white text-mare-laranja shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Icone size={16} />
            <span className="hidden lg:inline">{label}</span>
            {favoritos && totalFavoritos > 0 && (
              <span className="hidden rounded-full bg-mare-rosa/15 px-1.5 text-[10px] font-bold text-mare-rosa lg:inline">
                {totalFavoritos}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="hidden items-center gap-2 rounded-full bg-stone-100 px-3 py-2 md:flex">
          <IconeBusca size={14} className="text-stone-400" />
          <span className="sr-only">Buscar eventos</span>
          <input
            type="search"
            placeholder="Buscar..."
            className="w-24 bg-transparent text-xs outline-none placeholder:text-stone-400"
          />
        </label>

        <button
          type="button"
          aria-label={`Notificações${notificacoes ? ` (${notificacoes} novas)` : ""}`}
          className="relative grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"
        >
          <IconeSino size={18} />
          {notificacoes > 0 && (
            <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-mare-rosa text-[9px] font-bold text-white">
              {notificacoes}
            </span>
          )}
        </button>

        <div className="hidden items-center rounded-full bg-stone-100 px-4 py-2 text-xs sm:flex">
          {nomeUsuario}
        </div>
      </div>
    </header>
  );
}