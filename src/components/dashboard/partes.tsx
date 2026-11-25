
import Link from "next/link";
import type { CategoriaDashboard } from "@/data/dashboard";
import { IconeCoracao, IconeSeta } from "./icons";

const corDaCategoria: Record<string, string> = {
    Música: "bg-rose-100 text-rose-700",
    Feira: "bg-amber-100 text-amber-700",
    Natureza: "bg-green-100 text-green-700",
    Esporte: "bg-blue-100 text-blue-700",
    Cultura: "bg-purple-100 text-purple-700",
    Gastronomia: "bg-emerald-100 text-emerald-700",
};

export function Chip({
    categoria,
    mobile = false,
}: {
    categoria: CategoriaDashboard;
    mobile?: boolean;
}) {
    return (
        <span
            className={`inline-block px-2.5 py-0.5 text-[11px] font-bold ${
                mobile
                    ? "rounded-md uppercase tracking-wide"
                    : "rounded-full"
            } ${
                corDaCategoria[categoria] ??
                "bg-stone-100 text-stone-700"
            }`}
        >
            {categoria}
        </span>
    );
}

export function LinkDetalhesEvento({
    evento,
}: {
    evento: { id: number; titulo: string };
}) {
    return (
        <Link
            href={`/eventos/${evento.id}`}
            aria-label={`Ver detalhes de ${evento.titulo}`}
            className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mare-laranja"
        >
            <span className="sr-only">
                Ver detalhes de {evento.titulo}
            </span>
        </Link>
    );
}

export function BotaoFavorito({
    evento,
    ativo,
    onAlternar,
    escuro = false,
    className = "",
}: {
    evento: { id: number; titulo: string };
    ativo: boolean;
    onAlternar: (id: number) => void;
    escuro?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-pressed={ativo}
            aria-label={`${ativo ? "Remover dos" : "Adicionar aos"} favoritos: ${evento.titulo}`}
            onClick={() => onAlternar(evento.id)}
            className={`z-20 grid size-8 place-items-center rounded-full backdrop-blur transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-mare-rosa ${
                escuro
                    ? `bg-black/40 ${
                          ativo ? "text-mare-rosa" : "text-white"
                      }`
                    : `bg-white/90 ${
                          ativo ? "text-mare-rosa" : "text-stone-500"
                      }`
            } ${className}`}
        >
            <IconeCoracao size={16} ativo={ativo} />
        </button>
    );
}

export function BannerMapa({
    className = "",
    linha = false,
}: {
    className?: string;
    linha?: boolean;
}) {
    return (
        <Link
            href="/mapa"
            className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-mare-laranja font-titulo text-lg text-white shadow-sm transition-transform hover:scale-[1.01] ${
                linha ? "flex-row gap-2" : "flex-col gap-1.5"
            } ${className}`}
        >
            <span
                aria-hidden="true"
                className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_30%,#fff_0,transparent_35%),radial-gradient(circle_at_80%_70%,#7c2d12_0,transparent_40%)]"
            />

            <IconeSeta size={20} className="relative" />
            <span className="relative">Ver mapa interativo</span>
        </Link>
    );
}
