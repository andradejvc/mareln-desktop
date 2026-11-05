import { useMemo, useSyncExternalStore } from "react";

export type Usuario = { nome: string; email: string };

const CHAVE = "usuario";
const EVENTO = "usuario-mudou";

// Nome provisório tirado do e-mail: "joao.silva@gmail.com" vira "Joao".
export function nomeDoEmail(email: string) {
  const primeiro = email.split("@")[0].split(/[._-]/)[0].trim();
  if (!primeiro) return "Visitante";
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1);
}

function lerBruto() {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function converter(bruto: string): Usuario | null {
  try {
    const dados = JSON.parse(bruto);
    if (typeof dados?.nome === "string" && dados.nome) {
      return {
        nome: dados.nome,
        email: typeof dados.email === "string" ? dados.email : "",
      };
    }
  } catch {
    return null;
  }
  return null;
}

// Lê o usuário salvo (para usar dentro de funções, como o envio de um formulário).
export function lerUsuario(): Usuario | null {
  const bruto = lerBruto();
  return bruto ? converter(bruto) : null;
}

// Guarda o usuário e marca como logado. NUNCA guarde a senha aqui.
export function salvarUsuario(usuario: Usuario) {
  localStorage.setItem(CHAVE, JSON.stringify(usuario));
  localStorage.setItem("isLogged", "true");
  window.dispatchEvent(new Event(EVENTO));
}

function assinar(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

// Hook para os componentes.
// pronta = false só no primeiro instante, enquanto o navegador ainda não leu
// o localStorage (assim a tela não pisca como "visitante" para quem está logado).
export function useSessao(): { usuario: Usuario | null; pronta: boolean } {
  const bruto = useSyncExternalStore<string | null | undefined>(
    assinar,
    lerBruto,
    () => undefined,
  );
  return useMemo(
    () => ({
      usuario: bruto ? converter(bruto) : null,
      pronta: bruto !== undefined,
    }),
    [bruto],
  );
}

// Atalho para quem só precisa do usuário (ou null se não houver ninguém logado).
export function useUsuario(): Usuario | null {
  return useSessao().usuario;
}