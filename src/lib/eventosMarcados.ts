
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiRequest } from "@/lib/api";
import { lerAccessToken } from "@/lib/usuario";
import { useSessao } from "@/lib/usuario";

type EventoMarcadoBackend = {
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

// Busca as marcações pertencentes ao usuário autenticado.
export async function listarEventosMarcados(): Promise<number[]> {
  const resposta = await apiRequest<EventoMarcadoBackend[]>(
    "interactions/marked-events/me",
    {
      method: "GET",
      cache: "no-store",
      headers: obterHeadersAutenticados(),
    },
  );

  if (!Array.isArray(resposta)) {
    throw new Error("A API retornou uma lista de eventos marcados inválida.");
  }

  return Array.from(
    new Set(
      resposta
        .map((item) => item.eventoId)
        .filter((id) => Number.isSafeInteger(id) && id > 0),
    ),
  );
}

// Registra uma marcação no PostgreSQL.
export async function adicionarEventoMarcado(
  eventoId: number,
): Promise<void> {
  if (!Number.isSafeInteger(eventoId) || eventoId <= 0) {
    throw new Error("Identificador de evento inválido.");
  }

  await apiRequest<unknown>(
    `interactions/marked-events/${eventoId}`,
    {
      method: "POST",
      headers: obterHeadersAutenticados(),
    },
  );
}

// Remove uma marcação do PostgreSQL.
export async function removerEventoMarcado(
  eventoId: number,
): Promise<void> {
  if (!Number.isSafeInteger(eventoId) || eventoId <= 0) {
    throw new Error("Identificador de evento inválido.");
  }

  await apiRequest<unknown>(
    `interactions/marked-events/${eventoId}`,
    {
      method: "DELETE",
      headers: obterHeadersAutenticados(),
    },
  );
}

export function useEventosMarcados() {
  const { usuario, pronta } = useSessao();

  const [eventosMarcados, setEventosMarcados] = useState<number[]>([]);
  const [carregandoEventosMarcados, setCarregandoEventosMarcados] =
    useState(true);
  const [erroEventosMarcados, setErroEventosMarcados] = useState<
    string | null
  >(null);
  const [atualizandoEventosMarcados, setAtualizandoEventosMarcados] =
    useState<number[]>([]);

  const atualizandoRef = useRef(new Set<number>());

  // Carrega as marcações da conta autenticada.
  useEffect(() => {
    let ativo = true;

    async function carregarEventosMarcados() {
      if (!pronta) return;

      if (!usuario) {
        setEventosMarcados([]);
        setErroEventosMarcados(null);
        setCarregandoEventosMarcados(false);
        return;
      }

      if (!usuario.id) {
        setEventosMarcados([]);
        setErroEventosMarcados(
          "Não foi possível identificar sua conta. Entre novamente.",
        );
        setCarregandoEventosMarcados(false);
        return;
      }

      setCarregandoEventosMarcados(true);
      setErroEventosMarcados(null);
      setEventosMarcados([]);

      try {
        const resposta = await listarEventosMarcados();

        if (ativo) {
          setEventosMarcados(resposta);
        }
      } catch (erro) {
        if (ativo) {
          setEventosMarcados([]);
          setErroEventosMarcados(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar seus eventos marcados.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoEventosMarcados(false);
        }
      }
    }

    void carregarEventosMarcados();

    return () => {
      ativo = false;
    };
  }, [usuario?.id, pronta]);

  // Adiciona ou remove uma marcação no servidor.
  const alternarEventoMarcado = useCallback(
    async (id: number) => {
      if (!Number.isSafeInteger(id) || id <= 0) return;

      if (!usuario?.id) {
        setErroEventosMarcados(
          "Entre na sua conta para marcar eventos.",
        );
        return;
      }

      if (atualizandoRef.current.has(id)) return;

      atualizandoRef.current.add(id);

      setAtualizandoEventosMarcados((atuais) => [...atuais, id]);
      setErroEventosMarcados(null);

      const jaMarcado = eventosMarcados.includes(id);

      try {
        if (jaMarcado) {
          await removerEventoMarcado(id);

          setEventosMarcados((atuais) =>
            atuais.filter((eventoId) => eventoId !== id),
          );
        } else {
          await adicionarEventoMarcado(id);

          setEventosMarcados((atuais) =>
            atuais.includes(id) ? atuais : [...atuais, id],
          );
        }
      } catch (erro) {
        setErroEventosMarcados(
          erro instanceof Error
            ? erro.message
            : "Não foi possível atualizar a marcação do evento.",
        );

        // Reconsulta o servidor para manter a interface sincronizada.
        try {
          const resposta = await listarEventosMarcados();
          setEventosMarcados(resposta);
        } catch {
          // Preserva a mensagem do erro original.
        }
      } finally {
        atualizandoRef.current.delete(id);

        setAtualizandoEventosMarcados((atuais) =>
          atuais.filter((eventoId) => eventoId !== id),
        );
      }
    },
    [eventosMarcados, usuario?.id],
  );

  return {
    eventosMarcados,
    alternarEventoMarcado,
    carregandoEventosMarcados,
    erroEventosMarcados,
    atualizandoEventosMarcados,
  };
}
