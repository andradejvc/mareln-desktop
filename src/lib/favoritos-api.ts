
import { apiRequest } from "@/lib/api";
import { lerAccessToken } from "@/lib/usuario";

type FavoritoBackend = {
  id: number;
  usuarioId: number;
  eventoId: number;
};

function obterHeadersAutenticados(): HeadersInit {
  const token = lerAccessToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listarFavoritos(): Promise<number[]> {
  const resposta = await apiRequest<FavoritoBackend[]>(
    "interactions/favorites/me",
    {
      method: "GET",
      cache: "no-store",
      headers: obterHeadersAutenticados(),
    },
  );

  if (!Array.isArray(resposta)) {
    throw new Error("A API retornou uma lista de favoritos inválida.");
  }

  return Array.from(
    new Set(
      resposta
        .map((favorito) => favorito.eventoId)
        .filter(
          (id) => Number.isSafeInteger(id) && id > 0,
        ),
    ),
  );
}

export async function adicionarFavorito(
  eventoId: number,
): Promise<void> {
  if (!Number.isSafeInteger(eventoId) || eventoId <= 0) {
    throw new Error("Identificador de evento inválido.");
  }

  await apiRequest<unknown>(
    `interactions/favorites/${eventoId}`,
    {
      method: "POST",
      headers: obterHeadersAutenticados(),
    },
  );
}

export async function removerFavorito(
  eventoId: number,
): Promise<void> {
  if (!Number.isSafeInteger(eventoId) || eventoId <= 0) {
    throw new Error("Identificador de evento inválido.");
  }

  await apiRequest<unknown>(
    `interactions/favorites/${eventoId}`,
    {
      method: "DELETE",
      headers: obterHeadersAutenticados(),
    },
  );
}
