
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "@/lib/favoritos-api";

import { useSessao } from "@/lib/usuario";

export function useFavoritos() {
  const { usuario, pronta } = useSessao();

  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(true);
  const [erroFavoritos, setErroFavoritos] = useState<string | null>(null);
  const [atualizandoFavoritos, setAtualizandoFavoritos] = useState<
    number[]
  >([]);

  const atualizandoRef = useRef(new Set<number>());

  // Carrega os favoritos pertencentes ao usuário autenticado.
  useEffect(() => {
    let ativo = true;

    async function carregarFavoritos() {
      if (!pronta) return;

      if (!usuario) {
        setFavoritos([]);
        setErroFavoritos(null);
        setCarregandoFavoritos(false);
        return;
      }

      if (!usuario.id) {
        setFavoritos([]);
        setErroFavoritos("Não foi possível identificar sua conta.");
        setCarregandoFavoritos(false);
        return;
      }

      setCarregandoFavoritos(true);
      setErroFavoritos(null);
      setFavoritos([]);

      try {
        const resposta = await listarFavoritos();

        if (ativo) {
          setFavoritos(resposta);
        }
      } catch (erro) {
        if (ativo) {
          setFavoritos([]);
          setErroFavoritos(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar seus favoritos.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoFavoritos(false);
        }
      }
    }

    void carregarFavoritos();

    return () => {
      ativo = false;
    };
  }, [usuario?.id, pronta, usuario]);

  // Adiciona ou remove um favorito no PostgreSQL.
  const alternarFavorito = useCallback(
    async (id: number) => {
      if (!Number.isSafeInteger(id) || id <= 0) return;

      if (!usuario?.id) {
        setErroFavoritos("Entre na sua conta para salvar favoritos.");
        return;
      }

      if (atualizandoRef.current.has(id)) return;

      atualizandoRef.current.add(id);

      setAtualizandoFavoritos((atuais) => [...atuais, id]);
      setErroFavoritos(null);

      const jaFavoritado = favoritos.includes(id);

      try {
        if (jaFavoritado) {
          await removerFavorito(id);

          setFavoritos((atuais) =>
            atuais.filter((favorito) => favorito !== id),
          );
        } else {
          await adicionarFavorito(id);

          setFavoritos((atuais) =>
            atuais.includes(id) ? atuais : [...atuais, id],
          );
        }
      } catch (erro) {
        setErroFavoritos(
          erro instanceof Error
            ? erro.message
            : "Não foi possível atualizar seus favoritos.",
        );

        // Reconsulta o backend para manter a interface sincronizada.
        try {
          const resposta = await listarFavoritos();
          setFavoritos(resposta);
        } catch {
          // Mantém a mensagem do erro original.
        }
      } finally {
        atualizandoRef.current.delete(id);

        setAtualizandoFavoritos((atuais) =>
          atuais.filter((favorito) => favorito !== id),
        );
      }
    },
    [favoritos, usuario?.id],
  );

  return {
    favoritos,
    alternarFavorito,
    carregandoFavoritos,
    erroFavoritos,
    atualizandoFavoritos,
  };
}
