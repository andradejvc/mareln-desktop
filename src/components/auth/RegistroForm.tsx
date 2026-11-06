
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { salvarSessao, type Usuario } from "@/lib/usuario";

import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import Divisor from "./Divisor";

type RespostaRegistro = {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
};

export default function RegistroForm() {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nomeLimpo = usuario.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo) {
      setErro("Informe um nome de usuário.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(emailLimpo)) {
      setErro("Informe um endereço de e-mail válido.");
      return;
    }

    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resposta = await apiRequest<RespostaRegistro>(
        "auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            nome: nomeLimpo,
            email: emailLimpo,
            senha,
          }),
        },
      );

      salvarSessao(
        resposta.usuario,
        resposta.accessToken,
        resposta.refreshToken,
        true,
      );

      router.push("/dashboard");
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível criar sua conta.",
      );
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
          id="usuario"
          name="usuario"
          placeholder="Nome de Usuário"
          icone="usuario"
          autoComplete="username"
          value={usuario}
          onChange={setUsuario}
        />

        <AuthInput
          id="email"
          name="email"
          type="email"
          placeholder="Endereço de Email"
          icone="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />

        <AuthInput
          id="senha"
          name="senha"
          type="password"
          placeholder="Senha"
          icone="senha"
          autoComplete="new-password"
          value={senha}
          onChange={setSenha}
        />

        <AuthInput
          id="confirmar"
          name="confirmar"
          type="password"
          placeholder="Confirmar Senha"
          icone="senha"
          autoComplete="new-password"
          value={confirmar}
          onChange={setConfirmar}
        />

        {erro && (
          <p
            role="alert"
            className="text-center text-xs font-semibold text-mare-rosa"
          >
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="font-titulo mt-1 w-full rounded-xl bg-mare-laranja/25 px-4 py-2.5 text-base font-bold text-mare-laranja underline underline-offset-4 transition hover:bg-mare-laranja hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? "Criando conta..." : "Criar Conta"}
        </button>
      </form>

      <Divisor />
      <GoogleButton />

      <p className="mt-6 text-center text-xs text-gray-500">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-mare-laranja underline underline-offset-2"
        >
          Faça login.
        </Link>
      </p>
    </>
  );
}
