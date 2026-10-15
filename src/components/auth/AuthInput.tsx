"use client";

import { useState } from "react";

type Icone = "usuario" | "email" | "senha";

type AuthInputProps = {
  id: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  icone: Icone;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (valor: string) => void;
};

const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconeCampo({ icone }: { icone: Icone }) {
  if (icone === "usuario") {
    return (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
      </svg>
    );
  }
  if (icone === "email") {
    return (
      <svg {...svgProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function AuthInput({
  id,
  name,
  type = "text",
  placeholder,
  icone,
  autoComplete,
  required = true,
  value,
  onChange,
}: AuthInputProps) {
  const [mostrar, setMostrar] = useState(false);
  const ehSenha = type === "password";

  return (
        <div className="flex items-center gap-3 rounded-xl border-2 border-mare-laranja bg-white px-4 py-2.5 shadow-sm transition focus-within:ring-2 focus-within:ring-mare-laranja/40">
      <span className="text-mare-laranja">
        <IconeCampo icone={icone} />
      </span>

      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={name}
        type={ehSenha && mostrar ? "text" : type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-mare-laranja/70"
      />

      {ehSenha && (
        <button
          type="button"
          onClick={() => setMostrar((v) => !v)}
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          className="text-mare-laranja"
        >
          <svg {...svgProps}>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {mostrar && <path d="M3 3l18 18" />}
          </svg>
        </button>
      )}
    </div>
  );
}