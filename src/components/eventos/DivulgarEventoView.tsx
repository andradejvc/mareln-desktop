
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import {
  criarEvento,
  listarCategorias,
  type CategoriaBackend,
} from "@/lib/eventos-api";

import { useUsuario } from "@/lib/usuario";

export default function DivulgarEventoView() {
  const usuario = useUsuario();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erroCategorias, setErroCategorias] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const podeDivulgar =
    usuario?.tipo === "DIVULGADOR" ||
    usuario?.tipo === "ADMIN";

  useEffect(() => {
    let ativo = true;

    async function carregarCategorias() {
      try {
        const resposta = await listarCategorias();

        if (ativo) {
          setCategorias(resposta);
        }
      } catch (erro) {
        if (ativo) {
          setErroCategorias(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar as categorias.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoCategorias(false);
        }
      }
    }

    void carregarCategorias();

    return () => {
      ativo = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!podeDivulgar) {
      setErro("Somente divulgadores podem cadastrar eventos.");
      return;
    }

    setErro(null);

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      setErro("Informe uma data e horário válidos.");
      return;
    }

    setSalvando(true);

    try {
      await criarEvento({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: dataConvertida.toISOString(),
        local: local.trim(),
        ...(categoriaId ? { categoriaId: Number(categoriaId) } : {}),
      });

      setSucesso(true);
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar o evento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!podeDivulgar) {
    return (
      <main className="min-h-screen bg-mare-creme px-5 py-12">
        <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-titulo text-2xl font-bold text-stone-800">
            Acesso não permitido
          </h1>

          <p className="mt-3 text-sm text-stone-600">
            Somente usuários com perfil de divulgador ou administrador
            podem cadastrar eventos.
          </p>

          <Link
            href="/perfil"
            className="mt-6 inline-flex rounded-xl bg-mare-laranja px-6 py-3 font-bold text-white"
          >
            Voltar ao perfil
          </Link>
        </section>
      </main>
    );
  }

  if (sucesso) {
    return (
      <main className="min-h-screen bg-mare-creme px-5 py-12">
        <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <h1 className="font-titulo mt-5 text-2xl font-bold text-stone-800">
            Evento enviado com sucesso!
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Seu evento foi cadastrado e está aguardando aprovação de um
            administrador.
          </p>

          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Status: Pendente de aprovação
          </p>

          <Link
            href="/perfil"
            className="mt-6 inline-flex rounded-xl bg-mare-laranja px-6 py-3 font-bold text-white transition hover:opacity-90"
          >
            Voltar ao perfil
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mare-creme px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 text-sm font-semibold text-mare-laranja hover:underline"
        >
          <span aria-hidden="true">←</span>
          Voltar ao perfil
        </Link>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-md sm:p-8">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-mare-rosa">
              Área do divulgador
            </p>

            <h1 className="font-titulo mt-2 text-3xl font-bold text-stone-900">
              Divulgar evento
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Preencha as informações para cadastrar seu evento no Maré LN.
              Depois do envio, ele passará pela análise de um administrador.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="titulo-evento"
                className="mb-2 block text-sm font-bold text-stone-800"
              >
                Nome do evento
              </label>

              <input
                id="titulo-evento"
                type="text"
                required
                maxLength={150}
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex.: Festival de Música Caiçara"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
              />
            </div>

            <div>
              <label
                htmlFor="descricao-evento"
                className="mb-2 block text-sm font-bold text-stone-800"
              >
                Descrição
              </label>

              <textarea
                id="descricao-evento"
                required
                rows={5}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descreva a programação e as informações importantes do evento."
                className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
              />
            </div>

            <div>
              <label
                htmlFor="data-evento"
                className="mb-2 block text-sm font-bold text-stone-800"
              >
                Data e horário
              </label>

              <input
                id="data-evento"
                type="datetime-local"
                required
                value={data}
                onChange={(event) => setData(event.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
              />
            </div>

            <div>
              <label
                htmlFor="local-evento"
                className="mb-2 block text-sm font-bold text-stone-800"
              >
                Local do evento
              </label>

              <input
                id="local-evento"
                type="text"
                required
                value={local}
                onChange={(event) => setLocal(event.target.value)}
                placeholder="Ex.: Praça Cândido Mota, Caraguatatuba"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20"
              />

              <p className="mt-1 text-xs text-stone-500">
                Informe o nome do espaço e a cidade no mesmo campo.
              </p>
            </div>

            <div>
              <label
                htmlFor="categoria-evento"
                className="mb-2 block text-sm font-bold text-stone-800"
              >
                Categoria
              </label>

              <select
                id="categoria-evento"
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
                disabled={carregandoCategorias || categorias.length === 0}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-mare-laranja focus:ring-2 focus:ring-mare-laranja/20 disabled:bg-stone-100"
              >
                <option value="">
                  {carregandoCategorias
                    ? "Carregando categorias..."
                    : categorias.length === 0
                      ? "Nenhuma categoria disponível"
                      : "Sem categoria"}
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={String(categoria.id)}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {erroCategorias && (
                <p className="mt-2 text-xs text-amber-700">
                  Não foi possível carregar as categorias. Você ainda pode
                  cadastrar o evento sem categoria.
                </p>
              )}
            </div>

            {erro && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-xl bg-mare-laranja px-5 py-3.5 font-titulo text-lg font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Enviando evento..." : "Cadastrar evento"}
            </button>

            <p className="text-center text-xs leading-relaxed text-stone-500">
              O envio não publica o evento automaticamente. A publicação
              depende da aprovação de um administrador.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
