
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { salvarSessao, type Usuario } from "@/lib/usuario";

import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import Divisor from "./Divisor";

type RespostaLogin = {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
};

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<{
    email?: string;
    senha?: string;
  }>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const novosErros: {
      email?: string;
      senha?: string;
    } = {};

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      novosErros.email = "Informe seu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(emailLimpo)) {
      novosErros.email = "Digite um email válido.";
    }

    if (!senha) {
      novosErros.senha = "Informe sua senha.";
    } else if (senha.length < 8) {
      novosErros.senha = "A senha precisa ter pelo menos 8 caracteres.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);

    try {
      const resposta = await apiRequest<RespostaLogin>("auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: emailLimpo,
          senha,
        }),
      });

      salvarSessao(
        resposta.usuario,
        resposta.accessToken,
        resposta.refreshToken,
        lembrar,
      );

      const returnTo = new URLSearchParams(
        window.location.search,
      ).get("returnTo");

      const destinosPermitidos = [
        "/explorar",
        "/perfil",
        "/favoritos",
        "/mapa",
        "/divulgar-evento",
        "/meus-eventos",
      ];

      const destinoEventoPermitido =
        /^\/eventos\/\d+$/.test(returnTo ?? "");

      const destino =
        destinosPermitidos.includes(returnTo ?? "") ||
        destinoEventoPermitido
          ? returnTo!
          : "/dashboard";

      router.push(destino);
    } catch (erro) {
      setErros({
        senha:
          erro instanceof Error
            ? erro.message
            : "Não foi possível realizar o login.",
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-3"
      >
        <AuthInput
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          icone="usuario"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          erro={erros.email}
        />

        <AuthInput
          id="senha"
          name="senha"
          type="password"
          placeholder="Senha"
          icone="senha"
          autoComplete="current-password"
          value={senha}
          onChange={setSenha}
          erro={erros.senha}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="h-4 w-4 accent-mare-laranja"
            />
            Lembre-se
          </label>

          <Link
            href="/recuperar-senha"
            className="font-semibold text-mare-laranja underline underline-offset-2"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="font-titulo mt-1 w-full rounded-xl bg-mare-laranja/25 px-4 py-2.5 text-base font-bold text-mare-laranja underline underline-offset-4 transition hover:bg-mare-laranja hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Login"}
        </button>
      </form>

      <Divisor />
      <GoogleButton />

      <p className="mt-6 text-center text-xs text-gray-500">
        Ainda não tem uma conta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-mare-laranja underline underline-offset-2"
        >
          Cadastra-se.
        </Link>
      </p>
    </>
  );
}
