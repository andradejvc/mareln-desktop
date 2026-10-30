"use client";

import { useState } from "react";

const ICONES = {
  usuario: "fi-rr-user",
  email: "fi-rr-envelope",
  senha: "fi-rr-lock",
};

type AuthInputProps = {
  id: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  icone: keyof typeof ICONES;
  autoComplete?: string;
  value: string;
  onChange: (valor: string) => void;
  erro?: string;
};

export default function AuthInput({
  id,
  name,
  type = "text",
  placeholder,
  icone,
  autoComplete,
  value,
  onChange,
  erro,
}: AuthInputProps) {
  const [mostrar, setMostrar] = useState(false);
  const ehSenha = type === "password";

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 ${
          erro
            ? "border-rose-500 focus-within:ring-rose-500/30"
            : "border-mare-laranja focus-within:ring-mare-laranja/40"
        }`}
      >
        <i className={`${ICONES[icone]} text-lg text-mare-laranja`} />

        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <input
          id={id}
          name={name}
          type={ehSenha && mostrar ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={erro ? true : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-mare-laranja/70"
        />

        {ehSenha && (
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            className="text-lg text-mare-laranja"
          >
            <i className={mostrar ? "fi-rr-eye-crossed" : "fi-rr-eye"} />
          </button>
        )}
      </div>

      {erro && (
        <p role="alert" className="mt-1 px-1 text-xs font-medium text-rose-600">
          {erro}
        </p>
      )}
    </div>
  );
}