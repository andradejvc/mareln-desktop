"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import Divisor from "./Divisor";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [lembrar, setLembrar] = useState(false);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: integrar com a autenticação (API) aqui
        console.log({ email, senha, lembrar });
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <AuthInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    icone="usuario"
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
                    autoComplete="current-password"
                    value={senha}
                    onChange={setSenha}
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
                        href="#"
                        className="font-semibold text-mare-laranja underline underline-offset-2"
                    >
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
