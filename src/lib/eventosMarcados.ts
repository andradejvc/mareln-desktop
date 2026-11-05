"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const CHAVE = "mareln-eventos-marcados";
const EVENTO = "eventos-marcados-mudou";

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function converter(bruto: string | null | undefined): number[] {
  if (!bruto) return [];

  try {
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];

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
    return [];
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

export function useEventosMarcados() {
  const bruto = useSyncExternalStore<string | null | undefined>(
    assinar,
    lerBruto,
    () => undefined,
  );

  const eventosMarcados = useMemo(() => converter(bruto), [bruto]);

  const alternarEventoMarcado = useCallback((id: number) => {
    if (!Number.isSafeInteger(id) || id <= 0) return;

    const atuais = converter(lerBruto());
    const atualizados = atuais.includes(id)
      ? atuais.filter((eventoId) => eventoId !== id)
      : [...atuais, id];

    try {
      localStorage.setItem(CHAVE, JSON.stringify(atualizados));
      window.dispatchEvent(new Event(EVENTO));
    } catch {
      // Uma restrição do navegador não deve interromper a interface.
    }
  }, []);

  return { eventosMarcados, alternarEventoMarcado };
}
