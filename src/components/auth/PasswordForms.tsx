
"use client";

import "@flaticon/flaticon-uicons/css/regular/rounded.css";
import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";

import SeagullsBg from "./SeagullsBg";
import {
  IconeBusca,
  IconeCoracao,
  IconeInicio,
  IconeSeta,
  IconeUsuario,
} from "../dashboard/icons";

type PasswordShellProps = {
  titulo: string;
  subtitulo: string;
  icone: "email" | "senha";
  children: ReactNode;
};

const navegacao = [
  { href: "/", label: "Início", Icone: IconeInicio },
  { href: "/explorar", label: "Explorar", Icone: IconeBusca },
  { href: "/explorar", label: "Mapa", Icone: IconeSeta },
  {
    href: "/dashboard#favoritos-mobile",
    label: "Favoritos",
    Icone: IconeCoracao,
  },
  { href: "/perfil", label: "Perfil", Icone: IconeUsuario },
];

function PasswordShell({
  titulo,
  subtitulo,
  icone,
  children,
}: PasswordShellProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f9fc]">
      {/* Cabeçalho */}
      <header className="relative z-30 flex h-[90px] shrink-0 items-center justify-between rounded-b-xl bg-mare-laranja px-6 text-white shadow-sm md:h-20 md:rounded-none">
        <Link
          href="/"
          aria-label="Página inicial Maré LN"
          className="flex items-center gap-2"
        >
          <span className="grid size-10 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            M
          </span>

          <span className="font-titulo hidden text-xl font-bold md:inline">
            Maré LN
          </span>
        </Link>

        <Link
          href="/login"
          className="hidden text-sm font-semibold text-white/90 underline underline-offset-4 hover:text-white md:inline"
        >
          Voltar para o login
        </Link>

        <button
          type="button"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="menu-senha"
          onClick={() => setMenuAberto((atual) => !atual)}
          className="grid size-11 place-items-center rounded-full hover:bg-white/10 md:hidden"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuAberto ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        {menuAberto && (
          <nav
            id="menu-senha"
            aria-label="Navegação"
            className="absolute right-5 top-[calc(100%+0.5rem)] z-40 w-56 rounded-2xl bg-white p-2 text-stone-800 shadow-xl md:hidden"
          >
            {navegacao.map(({ href, label, Icone }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-stone-50"
              >
                <Icone size={18} />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Área principal */}
      <section className="relative flex flex-1 items-start justify-center px-5 pb-28 pt-10 md:items-center md:pb-12 md:pt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden md:hidden"
        >
          <SeagullsBg />
        </div>

        <div className="relative z-10 w-full max-w-md md:rounded-[2rem] md:bg-white md:px-10 md:py-9 md:shadow-xl md:shadow-orange-900/10">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm text-stone-400 underline underline-offset-4 transition hover:text-mare-laranja"
          >
            <span aria-hidden="true">←</span>
            Voltar para o login
          </Link>

          <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#f8d0bd] text-mare-laranja">
            {icone === "email" ? (
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m3 6 9 8 9-8" />
              </svg>
            ) : (
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="10" width="18" height="11" rx="3" />
                <path d="M7 10V7a5 5 0 0 1 10 0v3M12 14v3" />
              </svg>
            )}
          </div>

          <h1 className="font-titulo mt-8 text-center text-2xl font-bold text-mare-laranja">
            {titulo}
          </h1>

          <p className="font-titulo mx-auto mt-2 max-w-sm text-center text-sm font-bold leading-relaxed text-mare-laranja">
            {subtitulo}
          </p>

          <div className="mt-10">{children}</div>
        </div>
      </section>

      {/* Navegação mobile — sem banner de notificações nesta etapa */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {navegacao.map(({ href, label, Icone }) => (
            <li key={label} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-stone-400"
              >
                <Icone size={22} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}

export function RecuperarSenhaForm() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [solicitacaoDemonstrativa, setSolicitacaoDemonstrativa] =
    useState(false);

  function enviarSolicitacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailLimpo = email.trim();

    if (!emailLimpo) {
      setErro("Informe o e-mail da sua conta.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(emailLimpo)) {
      setErro("Digite um e-mail válido.");
      return;
    }

    setErro("");
    setSolicitacaoDemonstrativa(true);
  }

  return (
    <PasswordShell
      titulo="Recuperar Conta"
      subtitulo="Informe o e-mail da sua conta para iniciar o processo de recuperação de senha."
      icone="email"
    >
      {solicitacaoDemonstrativa ? (
        <div
          role="status"
          className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center"
        >
          <h2 className="font-titulo text-lg font-bold text-mare-laranja">
            Solicitação demonstrativa registrada
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            O envio de e-mail ainda não está ativo. Essa funcionalidade será
            conectada ao backend posteriormente.
          </p>

          <Link
            href="/alterar-senha"
            className="mt-5 inline-block font-semibold text-mare-laranja underline underline-offset-4"
          >
            Visualizar a tela de alteração de senha
          </Link>
        </div>
      ) : (
        <form
          onSubmit={enviarSolicitacao}
          noValidate
          className="flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="recuperar-email"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              E-mail
            </label>

            <div className="flex items-center gap-3 rounded-2xl border-2 border-mare-laranja bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-mare-laranja/20">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-mare-laranja"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m3 6 9 8 9-8" />
              </svg>

              <input
                id="recuperar-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                aria-invalid={Boolean(erro)}
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-mare-laranja/70"
              />
            </div>

            {erro && (
              <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
                {erro}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-mare-laranja/20 px-5 py-4 font-titulo text-base font-bold text-mare-laranja underline underline-offset-4 transition hover:bg-mare-laranja hover:text-white"
          >
            Solicitar recuperação
          </button>

          <p className="text-center text-xs text-stone-500">
            Precisa de ajuda?{" "}
            <Link
              href="/login"
              className="font-semibold text-mare-laranja underline underline-offset-2"
            >
              Voltar para o login.
            </Link>
          </p>
        </form>
      )}
    </PasswordShell>
  );
}

function analisarForca(senha: string) {
  const criterios = [
    senha.length >= 8,
    /[A-Za-zÀ-ÿ]/.test(senha),
    /\d/.test(senha),
    /[^A-Za-zÀ-ÿ0-9]/.test(senha),
  ];

  const pontos = criterios.filter(Boolean).length;

  const nivel =
    pontos <= 1
      ? "Fraca"
      : pontos === 2
        ? "Média"
        : pontos === 3
          ? "Boa"
          : "Forte";

  const cor =
    pontos <= 1
      ? "bg-red-600"
      : pontos === 2
        ? "bg-orange-500"
        : pontos === 3
          ? "bg-amber-500"
          : "bg-emerald-600";

  return { pontos, nivel, cor };
}

export function AlterarSenhaForm() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [validacaoDemonstrativa, setValidacaoDemonstrativa] = useState(false);

  const forca = analisarForca(senha);

  function atualizarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (!/[A-Za-zÀ-ÿ]/.test(senha) || !/\d/.test(senha) || !/[^A-Za-zÀ-ÿ0-9]/.test(senha)) {
      setErro("Use letras, números e pelo menos um símbolo.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");
    setValidacaoDemonstrativa(true);
  }

  return (
    <PasswordShell
      titulo="Alterar Senha"
      subtitulo="Escolha uma nova senha forte que você ainda não usa."
      icone="senha"
    >
      {validacaoDemonstrativa ? (
        <div
          role="status"
          className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center"
        >
          <h2 className="font-titulo text-lg font-bold text-mare-laranja">
            Validação concluída
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Os campos foram validados, mas nenhuma senha foi alterada. A
            atualização real será ativada quando a autenticação estiver
            integrada ao backend.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-mare-laranja px-6 py-3 font-bold text-white"
          >
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={atualizarSenha}
          noValidate
          className="flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="nova-senha"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              Nova senha
            </label>

            <div className="flex items-center gap-3 rounded-2xl border-2 border-mare-laranja bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-mare-laranja/20">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-mare-laranja"
                aria-hidden="true"
              >
                <rect x="3" y="10" width="18" height="11" rx="3" />
                <path d="M7 10V7a5 5 0 0 1 10 0v3" />
              </svg>

              <input
                id="nova-senha"
                name="novaSenha"
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua nova senha"
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-mare-laranja/70"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmar-senha"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              Confirmar nova senha
            </label>

            <div className="flex items-center gap-3 rounded-2xl border-2 border-mare-laranja bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-mare-laranja/20">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-mare-laranja"
                aria-hidden="true"
              >
                <rect x="3" y="10" width="18" height="11" rx="3" />
                <path d="M7 10V7a5 5 0 0 1 10 0v3" />
              </svg>

              <input
                id="confirmar-senha"
                name="confirmarSenha"
                type="password"
                autoComplete="new-password"
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                placeholder="Confirme sua nova senha"
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-mare-laranja/70"
              />
            </div>
          </div>

          {/* Indicador de força */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-700">Força da senha:</span>
              <span
                className={
                  forca.pontos <= 1
                    ? "text-red-600"
                    : forca.pontos === 2
                      ? "text-orange-600"
                      : forca.pontos === 3
                        ? "text-amber-600"
                        : "text-emerald-700"
                }
              >
                {forca.nivel}
              </span>
            </div>

            <div
              className="mt-2 grid grid-cols-4 gap-2"
              aria-label={`Força da senha: ${forca.nivel}`}
            >
              {[0, 1, 2, 3].map((segmento) => (
                <span
                  key={segmento}
                  className={`h-1.5 rounded-full ${
                    segmento < forca.pontos ? forca.cor : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {erro && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="rounded-2xl bg-mare-laranja/20 px-5 py-4 font-titulo text-base font-bold text-mare-laranja underline underline-offset-4 transition hover:bg-mare-laranja hover:text-white"
          >
            Validar nova senha
          </button>

          <div className="border-t border-stone-300 pt-4">
            <p className="flex items-center gap-2 text-xs font-bold text-mare-laranja">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Dica de segurança:
            </p>

            <p className="mt-2 pl-7 text-xs font-semibold text-stone-400">
              Use pelo menos 8 caracteres com letras, números e símbolos.
            </p>
          </div>
        </form>
      )}
    </PasswordShell>
  );
}
