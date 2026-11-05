"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lerUsuario, nomeDoEmail, salvarUsuario } from "@/lib/usuario";
import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import Divisor from "./Divisor";

// Conta de teste (temporária) — troque pela API de login quando existir
const EMAIL_TESTE = "teste@mare.com";
const SENHA_TESTE = "123456";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const novosErros: { email?: string; senha?: string } = {};

    if (!email.trim()) novosErros.email = "Informe seu email.";
    else if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())) novosErros.email = "Digite um email válido.";

    if (!senha) novosErros.senha = "Informe sua senha.";
    else if (senha.length < 6) novosErros.senha = "A senha precisa ter pelo menos 6 caracteres.";

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // TODO: trocar por chamada à API de autenticação
    if (email.trim().toLowerCase() !== EMAIL_TESTE || senha !== SENHA_TESTE) {
      setErros({ senha: "Email ou senha incorretos." });
      return;
    }

    // Guarda só nome e e-mail (nunca a senha) para o dashboard usar.
    const returnTo = new URLSearchParams(window.location.search).get("returnTo");

    const destino = returnTo === "/explorar"
      ? "/explorar"
      : "/dashboard";

    router.push(destino);
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
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
          <Link href="#" className="font-semibold text-mare-laranja underline underline-offset-2">
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          className="font-titulo mt-1 w-full rounded-xl bg-mare-laranja/25 px-4 py-2.5 text-base font-bold text-mare-laranja underline underline-offset-4 transition hover:bg-mare-laranja hover:text-white"
        >
          Login
        </button>
      </form>

      <Divisor />
      <GoogleButton />

      <p className="mt-6 text-center text-xs text-gray-500">
        Ainda não tem uma conta?{" "}
        <Link href="/registro" className="font-semibold text-mare-laranja underline underline-offset-2">
          Cadastra-se.
        </Link>
      </p>
    </>
  );
}