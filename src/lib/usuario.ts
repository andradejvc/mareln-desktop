import { useMemo, useSyncExternalStore } from 'react';

export type TipoUsuario = 'VISITANTE' | 'DIVULGADOR' | 'ADMIN';

export type Usuario = {
  id?: number;
  nome: string;
  email: string;
  tipo?: TipoUsuario;
  cidadePreferida?: string | null;
  interesses?: string[];
  fotoPerfilUrl?: string | null;
};

const CHAVE = 'usuario';
const CHAVE_ACCESS = 'mareln-access-token';
const CHAVE_REFRESH = 'mareln-refresh-token';
const CHAVE_LOGADO = 'isLogged';
const EVENTO = 'usuario-mudou';

const TIPOS_VALIDOS: TipoUsuario[] = ['VISITANTE', 'DIVULGADOR', 'ADMIN'];

function obterArmazenamentoAtual(): Storage | null {
  try {
    if (localStorage.getItem(CHAVE)) return localStorage;
    if (sessionStorage.getItem(CHAVE)) return sessionStorage;
  } catch {
    return null;
  }

  return null;
}

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function converter(bruto: string): Usuario | null {
  try {
    const dados: unknown = JSON.parse(bruto);

    if (!dados || typeof dados !== 'object') return null;

    const usuario = dados as Record<string, unknown>;

    if (typeof usuario.nome !== 'string' || !usuario.nome) return null;

    return {
      ...(Number.isSafeInteger(usuario.id) ? { id: usuario.id as number } : {}),
      nome: usuario.nome,
      email: typeof usuario.email === 'string' ? usuario.email : '',
      ...(TIPOS_VALIDOS.includes(usuario.tipo as TipoUsuario)
        ? { tipo: usuario.tipo as TipoUsuario }
        : {}),
      ...(typeof usuario.cidadePreferida === 'string' || usuario.cidadePreferida === null
        ? { cidadePreferida: usuario.cidadePreferida }
        : {}),
      ...(Array.isArray(usuario.interesses)
        ? { interesses: usuario.interesses.filter((item): item is string => typeof item === 'string') }
        : {}),
      ...(typeof usuario.fotoPerfilUrl === 'string' || usuario.fotoPerfilUrl === null
        ? { fotoPerfilUrl: usuario.fotoPerfilUrl }
        : {}),
    };
  } catch {
    return null;
  }
}

export function lerUsuario(): Usuario | null {
  const bruto = lerBruto();
  return bruto ? converter(bruto) : null;
}

export function salvarSessao(
  usuario: Usuario,
  accessToken: string,
  refreshToken: string,
  lembrar: boolean,
) {
  if (!accessToken || !refreshToken) {
    throw new Error('A API não retornou os tokens de autenticação.');
  }

  const destino = lembrar ? localStorage : sessionStorage;
  const outro = lembrar ? sessionStorage : localStorage;

  for (const storage of [destino, outro]) {
    if (storage === outro) {
      storage.removeItem(CHAVE);
      storage.removeItem(CHAVE_ACCESS);
      storage.removeItem(CHAVE_REFRESH);
      storage.removeItem(CHAVE_LOGADO);
    }
  }

  destino.setItem(CHAVE, JSON.stringify(usuario));
  destino.setItem(CHAVE_ACCESS, accessToken);
  destino.setItem(CHAVE_REFRESH, refreshToken);
  destino.setItem(CHAVE_LOGADO, 'true');

  window.dispatchEvent(new Event(EVENTO));
}

export function atualizarTokens(accessToken: string, refreshToken: string) {
  if (!accessToken || !refreshToken) {
    throw new Error('A API não retornou os novos tokens.');
  }

  const storage = obterArmazenamentoAtual();

  if (!storage) throw new Error('Nenhuma sessão ativa foi encontrada.');

  storage.setItem(CHAVE_ACCESS, accessToken);
  storage.setItem(CHAVE_REFRESH, refreshToken);
  window.dispatchEvent(new Event(EVENTO));
}

export function salvarUsuario(usuario: Usuario) {
  const storage = obterArmazenamentoAtual() ?? localStorage;
  const atual = lerUsuario();

  storage.setItem(CHAVE, JSON.stringify({ ...atual, ...usuario }));
  storage.setItem(CHAVE_LOGADO, 'true');
  window.dispatchEvent(new Event(EVENTO));
}

export function lerAccessToken(): string | null {
  return obterArmazenamentoAtual()?.getItem(CHAVE_ACCESS) ?? null;
}

export function lerRefreshToken(): string | null {
  return obterArmazenamentoAtual()?.getItem(CHAVE_REFRESH) ?? null;
}

export function encerrarSessao() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(CHAVE);
    storage.removeItem(CHAVE_ACCESS);
    storage.removeItem(CHAVE_REFRESH);
    storage.removeItem(CHAVE_LOGADO);
  }

  window.dispatchEvent(new Event(EVENTO));
}

function assinar(aviso: () => void) {
  window.addEventListener('storage', aviso);
  window.addEventListener(EVENTO, aviso);

  return () => {
    window.removeEventListener('storage', aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

export function useSessao(): { usuario: Usuario | null; pronta: boolean } {
  const bruto = useSyncExternalStore<string | null | undefined>(
    assinar,
    lerBruto,
    () => undefined,
  );

  return useMemo(
    () => ({ usuario: bruto ? converter(bruto) : null, pronta: bruto !== undefined }),
    [bruto],
  );
}

export function useUsuario(): Usuario | null {
  return useSessao().usuario;
}
