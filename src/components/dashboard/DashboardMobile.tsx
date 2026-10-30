import Image from "next/image";
import Link from "next/link";
import { cidades, type Cidade } from "@/data/eventos";
import type { EventoDashboard } from "@/data/dashboard";
import {
  IconeBusca,
  IconeCoracao,
  IconeInicio,
  IconeSeta,
  IconeSino,
  IconeUsuario,
} from "./icons";
import { BannerMapa, BotaoFavorito, Chip } from "./partes";

type Props = {
  nomeUsuario: string;
  notificacoes: number;
  cidade: Cidade | null;
  onCidade: (cidade: Cidade | null) => void;
  favoritos: number[];
  onFavorito: (id: number) => void;
  hoje: EventoDashboard[];
  sugestoes: EventoDashboard[];
  meusFavoritos: EventoDashboard[];
  proximos: EventoDashboard[];
};

const abas = [
  { href: "/dashboard", label: "Início", Icone: IconeInicio, ativo: true },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca },
  { href: "/explorar", label: "Mapa", Icone: IconeSeta },
  { href: "#favoritos-mobile", label: "Favoritos", Icone: IconeCoracao },
  { href: "/login", label: "Perfil", Icone: IconeUsuario },
];

// Faixa horizontal que rola de lado (cards "compactos").
const faixa =
  "flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function TituloSecao({
  titulo,
  acao,
}: {
  titulo: string;
  acao?: { href: string; label: string };
}) {
  return (
    <div className="mb-3 flex items-center justify-between px-5">
      <h2 className="font-titulo text-2xl">{titulo}</h2>
      {acao && (
        <Link href={acao.href} className="text-sm font-bold text-mare-rosa">
          {acao.label}
        </Link>
      )}
    </div>
  );
}

function CardMobile({
  evento,
  favorito,
  onFavorito,
  compacto = false,
}: {
  evento: EventoDashboard;
  favorito: boolean;
  onFavorito: (id: number) => void;
  compacto?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-2xl bg-white shadow-sm shadow-orange-900/10 ${
        compacto ? "w-56 shrink-0 snap-start" : "w-full"
      }`}
    >
      <div className={`relative ${compacto ? "h-28" : "h-36"}`}>
        <Image
          src={evento.imagem}
          alt=""
          fill
          sizes={compacto ? "224px" : "(min-width: 640px) 576px, 100vw"}
          className="object-cover"
        />
        {evento.hoje && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-mare-rosa px-2 py-0.5 text-[11px] font-bold text-white">
            HOJE
          </span>
        )}
        <BotaoFavorito
          evento={evento}
          ativo={favorito}
          onAlternar={onFavorito}
          className="absolute right-2.5 top-2.5"
        />
      </div>

      <div className="space-y-1.5 p-3.5">
        <h3
          className={`font-bold leading-snug ${
            compacto ? "truncate text-sm" : "text-lg"
          }`}
        >
          {evento.titulo}
        </h3>
        <Chip categoria={evento.categoria} mobile />
        <p className="text-xs text-stone-500">
          {evento.data} • {evento.hora}
        </p>
        <p className={`text-xs text-stone-500 ${compacto ? "truncate" : ""}`}>
          {evento.local}, {evento.cidade}
        </p>
      </div>
    </article>
  );
}

export default function DashboardMobile({
  nomeUsuario,
  notificacoes,
  cidade,
  onCidade,
  favoritos,
  onFavorito,
  hoje,
  sugestoes,
  meusFavoritos,
  proximos,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-xl pb-28">
      {/* Cabeçalho laranja */}
      <header className="rounded-b-[2rem] bg-mare-laranja px-5 pb-6 pt-8 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">
              Bem-vindo de volta
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              Oi, {nomeUsuario}! <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-white/90">
              O que vamos descobrir hoje?
            </p>
          </div>

          <button
            type="button"
            aria-label={`Notificações${notificacoes ? ` (${notificacoes} novas)` : ""}`}
            className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/20"
          >
            <IconeSino size={20} />
            {notificacoes > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-mare-rosa text-[10px] font-bold">
                {notificacoes}
              </span>
            )}
          </button>
        </div>

        <label className="mt-5 flex items-center gap-2.5 rounded-full bg-white px-4 py-3 text-stone-400 shadow-sm">
          <IconeBusca size={18} />
          <span className="sr-only">Buscar eventos</span>
          <input
            type="search"
            placeholder="Buscar eventos..."
            className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
          />
        </label>
      </header>

      {/* Cidades (rolagem lateral) */}
      <div
        role="group"
        aria-label="Filtrar por cidade"
        className="flex gap-2 overflow-x-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cidades.map((c) => {
          const ativa = cidade === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={ativa}
              onClick={() => onCidade(ativa ? null : c)}
              className={`shrink-0 rounded-full border-2 border-mare-laranja px-4 py-1.5 text-sm font-bold ${
                ativa ? "bg-mare-laranja text-white" : "bg-white text-mare-laranja"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {/* Acontecendo hoje */}
        {hoje.length > 0 && (
          <section aria-label="Acontecendo hoje">
            <TituloSecao
              titulo="Acontecendo hoje"
              acao={{ href: "/explorar", label: "Ver tudo →" }}
            />
            <div className={faixa}>
              {hoje.map((e) => (
                <CardMobile
                  key={e.id}
                  evento={e}
                  compacto
                  favorito={favoritos.includes(e.id)}
                  onFavorito={onFavorito}
                />
              ))}
            </div>
          </section>
        )}

        {/* Pode te interessar */}
        <section aria-label="Pode te interessar">
          <TituloSecao titulo="Pode te interessar" />
          <div className="space-y-3 px-5">
            {sugestoes.slice(0, 2).map((e) => (
              <CardMobile
                key={e.id}
                evento={e}
                favorito={favoritos.includes(e.id)}
                onFavorito={onFavorito}
              />
            ))}
          </div>
        </section>

        {/* Meus favoritos */}
        <section id="favoritos-mobile" aria-label="Meus favoritos" className="scroll-mt-4">
          <TituloSecao
            titulo="Meus favoritos"
            acao={{ href: "#favoritos-mobile", label: "Ver todos →" }}
          />
          {meusFavoritos.length === 0 ? (
            <p className="px-5 text-sm text-stone-500">
              Toque no coração de um evento para guardá-lo aqui.
            </p>
          ) : (
            <div className={faixa}>
              {meusFavoritos.map((e) => (
                <CardMobile
                  key={e.id}
                  evento={e}
                  compacto
                  favorito
                  onFavorito={onFavorito}
                />
              ))}
            </div>
          )}
        </section>

        {/* Próximos eventos */}
        <section aria-label="Próximos eventos">
          <TituloSecao titulo="Próximos eventos" />
          <div className="space-y-3 px-5">
            {proximos.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
                Nenhum evento próximo nessa cidade por enquanto.
              </p>
            ) : (
              proximos.slice(0, 3).map((e) => (
                <CardMobile
                  key={e.id}
                  evento={e}
                  favorito={favoritos.includes(e.id)}
                  onFavorito={onFavorito}
                />
              ))
            )}
          </div>
        </section>

        {/* Botões finais */}
        <div className="space-y-4 px-5">
          <Link
            href="/explorar"
            className="block rounded-2xl bg-mare-laranja py-4 text-center font-titulo text-xl text-white shadow-sm"
          >
            Ver todos os eventos →
          </Link>
          <BannerMapa linha className="h-24" />
        </div>
      </div>

      {/* Barra de abas fixa embaixo */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {abas.map(({ href, label, Icone, ativo }) => (
            <li key={label} className="flex-1">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  ativo ? "font-bold text-mare-laranja" : "text-stone-400"
                }`}
              >
                <Icone size={22} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
