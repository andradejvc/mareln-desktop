
import { apiRequest } from "@/lib/api";
import { lerAccessToken } from "@/lib/usuario";
import type { EventoBackend } from "@/lib/eventos-api";

export type StatusEventoAdmin = "APROVADO" | "REJEITADO";

export type EventoAdmin = Omit<EventoBackend, "usuario"> & {
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
};

type RespostaPaginada<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function obterHeadersAdmin(): HeadersInit {
  const token = lerAccessToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listarEventosAdmin(): Promise<EventoAdmin[]> {
  const eventos: EventoAdmin[] = [];

  let pagina = 1;
  let totalPaginas = 1;

  do {
    const resposta = await apiRequest<RespostaPaginada<EventoAdmin>>(
      `admin/eventos?page=${pagina}&limit=50`,
      {
        method: "GET",
        cache: "no-store",
        headers: obterHeadersAdmin(),
      },
    );

    if (!Array.isArray(resposta.data)) {
      throw new Error("A API retornou uma lista de eventos inválida.");
    }

    eventos.push(...resposta.data);
    totalPaginas = resposta.totalPages;
    pagina += 1;
  } while (pagina <= totalPaginas);

  return eventos;
}

export async function atualizarStatusEvento(
  id: number,
  status: StatusEventoAdmin,
): Promise<void> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Identificador de evento inválido.");
  }

  await apiRequest<unknown>(`admin/eventos/${id}/status`, {
    method: "PATCH",
    headers: obterHeadersAdmin(),
    body: JSON.stringify({ status }),
  });
}
