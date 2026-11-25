import { apiRequest, apiUpload } from "@/lib/api";
import { lerAccessToken } from "@/lib/usuario";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export type PerfilUsuario = {
    id: number;
    nome: string;
    email: string;
    tipo: "VISITANTE" | "DIVULGADOR" | "ADMIN";
    cidadePreferida: string | null;
    interesses: string[];
    fotoPerfilUrl: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type AtualizarPerfil = {
    nome?: string;
    email?: string;
    cidadePreferida?: string | null;
    interesses?: string[];
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

function validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error("Identificador de usuário inválido.");
    }
}

export function obterUrlFotoPerfil(
    fotoPerfilUrl: string | null,
): string | null {
    if (!fotoPerfilUrl) return null;

    if (/^https?:\/\//i.test(fotoPerfilUrl)) {
        return fotoPerfilUrl;
    }

    return `${API_BASE_URL ?? ""}${fotoPerfilUrl}`;
}

export async function buscarPerfilUsuario(
    id: number,
): Promise<PerfilUsuario> {
    validarId(id);

    return apiRequest<PerfilUsuario>(`usuarios/${id}`, {
        method: "GET",
        cache: "no-store",
        headers: obterHeadersAutenticados(),
    });
}

export async function atualizarPerfilUsuario(
    id: number,
    dados: AtualizarPerfil,
): Promise<PerfilUsuario> {
    validarId(id);

    return apiRequest<PerfilUsuario>(`usuarios/${id}`, {
        method: "PATCH",
        headers: obterHeadersAutenticados(),
        body: JSON.stringify(dados),
    });
}

export async function enviarFotoPerfil(
    arquivo: File,
): Promise<PerfilUsuario> {
    const formulario = new FormData();

    formulario.append("foto", arquivo);

    return apiUpload<PerfilUsuario>(
        "usuarios/me/foto",
        formulario,
    );
}

export async function excluirFotoPerfil(): Promise<PerfilUsuario> {
    return apiRequest<PerfilUsuario>("usuarios/me/foto", {
        method: "DELETE",
        headers: obterHeadersAutenticados(),
    });
}