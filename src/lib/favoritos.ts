"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { favoritosIniciais } from "@/data/eventos";

const CHAVE = "mareln-favoritos";
const EVENTO = "favoritos-mudou";

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function converter(bruto: string | null | undefined): number[] {
  if (bruto === null || bruto === undefined) {
    return [...favoritosIniciais];
  }

  try {
    const dados: unknown = JSON.parse(bruto);

    if (!Array.isArray(dados)) {
      return [...favoritosIniciais];
    }

    return Array.from(
      new Set(
        dados.filter(
          (id): id is number =>
            typeof id === "number" &&
            Number.isSafeInteger(id) &&
            id > 0,
        ),
      ),
    );
  } catch {
    return [...favoritosIniciais];
  }
}

function assinar(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO, aviso);

  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

export function useFavoritos() {
  const bruto = useSyncExternalStore<string | null | undefined>(
    assinar,
    lerBruto,
    () => undefined,
  );

  const favoritos = useMemo(() => converter(bruto), [bruto]);

  const alternarFavorito = useCallback((id: number) => {
    if (!Number.isSafeInteger(id) || id <= 0) return;

    const atuais = converter(lerBruto());

    const atualizados = atuais.includes(id)
      ? atuais.filter((favorito) => favorito !== id)
      : [...atuais, id];

    try {
      localStorage.setItem(CHAVE, JSON.stringify(atualizados));
      window.dispatchEvent(new Event(EVENTO));
    } catch {
      // Impede que uma restrição do navegador interrompa a interface.
    }
  }, []);

  return {
    favoritos,
    alternarFavorito,
  };
}