"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import Divisor from "./Divisor";

export default function RegistroForm() {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    // TODO: integrar com o cadastro (API) aqui
    console.log({ usuario, email, senha });
  }

  return (
    <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          <p role="alert" className="text-center text-xs font-semibold text-mare-rosa">
            {erro}
          </p>
        )}

        <button
          type="submit"
                    className="font-titulo mt-1 w-full rounded-xl bg-mare-laranja/25 px-4 py-2.5 text-base font-bold text-mare-laranja underline underline-offset-4 transition hover:bg-mare-laranja hover:text-white"
        >
          Criar Conta
        </button>
      </form>

      <Divisor />
      <GoogleButton />

      <p className="mt-6 text-center text-xs text-gray-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-mare-laranja underline underline-offset-2">
          Faça login.
        </Link>
      </p>
    </>
  );
}