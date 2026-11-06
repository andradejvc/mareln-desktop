const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      "URL da API não configurada. Verifique o arquivo .env.local.",
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/${path.replace(/^\/+/, "")}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.",
    );
  }

  const dados: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      dados &&
      typeof dados === "object" &&
      "message" in dados
        ? dados.message
        : null;

    if (Array.isArray(mensagem)) {
      throw new Error(mensagem.join(", "));
    }

    throw new Error(
      typeof mensagem === "string"
        ? mensagem
        : `Erro na comunicação com a API (${response.status}).`,
    );
  }

  return dados as T;
}