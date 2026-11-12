
import {
  atualizarTokens,
  encerrarSessao,
  lerAccessToken,
  lerRefreshToken,
} from "@/lib/usuario";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

type RespostaRefresh = {
  accessToken: string;
  refreshToken: string;
};

let renovacaoEmAndamento: Promise<string | null> | null = null;

async function renovarAccessToken(
  tokenUtilizado: string | null,
): Promise<string | null> {
  // Outra requisição pode já ter renovado o token.
  const tokenAtual = lerAccessToken();

  if (tokenAtual && tokenAtual !== tokenUtilizado) {
    return tokenAtual;
  }

  // Reutiliza a mesma renovação em requisições simultâneas.
  if (renovacaoEmAndamento) {
    return renovacaoEmAndamento;
  }

  const refreshToken = lerRefreshToken();

  if (!refreshToken || !API_BASE_URL) {
    return null;
  }

  const promessa = (async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const dados: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        // Se o refresh token também expirou ou foi invalidado,
        // encerra a sessão para evitar manter uma autenticação falsa.
        if (response.status === 401 || response.status === 403) {
          encerrarSessao();
        }

        return null;
      }

      if (
        !dados ||
        typeof dados !== "object" ||
        !("accessToken" in dados) ||
        !("refreshToken" in dados) ||
        typeof dados.accessToken !== "string" ||
        typeof dados.refreshToken !== "string"
      ) {
        return null;
      }

      const novosTokens = dados as RespostaRefresh;

      atualizarTokens(
        novosTokens.accessToken,
        novosTokens.refreshToken,
      );

      return novosTokens.accessToken;
    } catch {
      // Falha de conexão não deve apagar uma sessão válida.
      return null;
    }
  })();

  renovacaoEmAndamento = promessa;

  try {
    return await promessa;
  } finally {
    if (renovacaoEmAndamento === promessa) {
      renovacaoEmAndamento = null;
    }
  }
}

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

  const executarRequisicao = async (
    cabecalhos: Headers,
  ): Promise<Response> => {
    try {
      return await fetch(
        `${API_BASE_URL}/${path.replace(/^\/+/, "")}`,
        {
          ...options,
          headers: cabecalhos,
        },
      );
    } catch {
      throw new Error(
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.",
      );
    }
  };

  let response = await executarRequisicao(headers);

  const caminho = path.replace(/^\/+/, "").split("?")[0];

  const rotasSemRenovacao = [
    "auth/login",
    "auth/register",
    "auth/refresh",
  ];

  // Tenta renovar o token somente quando uma rota protegida
  // retornar 401 Unauthorized.
  if (
    response.status === 401 &&
    !rotasSemRenovacao.includes(caminho)
  ) {
    const authorization = headers.get("Authorization");

    const tokenUtilizado =
      authorization?.replace(/^Bearer\s+/i, "") ??
      lerAccessToken();

    const novoAccessToken =
      await renovarAccessToken(tokenUtilizado);

    if (novoAccessToken) {
      const novosHeaders = new Headers(headers);

      novosHeaders.set(
        "Authorization",
        `Bearer ${novoAccessToken}`,
      );

      // Repete a requisição original com o novo access token.
      response = await executarRequisicao(novosHeaders);
    }
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

export async function apiUpload<T>(
  path: string,
  arquivo: FormData,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      "URL da API não configurada. Verifique o arquivo .env.local.",
    );
  }

  const executarRequisicao = async (
    token: string,
  ): Promise<Response> => {
    try {
      return await fetch(
        `${API_BASE_URL}/${path.replace(/^\/+/, "")}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: arquivo,
        },
      );
    } catch {
      throw new Error(
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.",
      );
    }
  };

  let token = lerAccessToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  let response = await executarRequisicao(token);

  if (response.status === 401) {
    const novoAccessToken = await renovarAccessToken(token);

    if (novoAccessToken) {
      token = novoAccessToken;
      response = await executarRequisicao(token);
    }
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
        : `Erro no envio do arquivo (${response.status}).`,
    );
  }

  return dados as T;
}
