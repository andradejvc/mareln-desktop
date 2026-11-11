
import { apiRequest } from "@/lib/api";
import { cidades, type Cidade } from "@/data/eventos";
import { lerAccessToken } from "@/lib/usuario";

export type EventoBackend = {
    id: number;
    titulo: string;
    descricao: string;
    data: string;
    local: string;
    status: "PENDENTE" | "APROVADO" | "REJEITADO";
    usuarioId: number;
    categoriaId: number | null;
    criadoEm: string;
    atualizadoEm: string;
    usuario?: {
        id: number;
        nome: string;
    };
    categoria?: {
        id: number;
        nome: string;
    } | null;
};

export type EventoExplorar = {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
    data: string;
    hora: string;
    local: string;
    cidade: Cidade | null;
    imagem: string;
    status: EventoBackend["status"];
};

const imagensPorCategoria: Record<string, string> = {
    Música: "/image/musical.jpg",
    Cultura: "/image/cultura.jpg",
    Esporte: "/image/esportes.jpg",
    Natureza: "/image/terceira-img.jpg",
    Feira: "/image/feiras.jpg",
    Gastronomia: "/image/segunda-img.jpg",
};

const imagemPadrao = "/image/terceira-img.jpg";

function identificarCidade(local: string): Cidade | null {
    const normalizar = (valor: string) =>
        valor.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();

    return (
        cidades.find((cidade) => normalizar(cidade) === normalizar(local)) ??
        null
    );
}

function normalizarEvento(evento: EventoBackend): EventoExplorar {
    const dataEvento = new Date(evento.data);

    if (Number.isNaN(dataEvento.getTime())) {
        throw new Error(`Data inválida no evento ${evento.id}.`);
    }

    const categoria = evento.categoria?.nome ?? "Sem categoria";

    return {
        id: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao,
        categoria,
        data: new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            timeZone: "America/Sao_Paulo",
        }).format(dataEvento),
        hora: new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
        }).format(dataEvento),
        local: evento.local,
        cidade: identificarCidade(evento.local),
        imagem: imagensPorCategoria[categoria] ?? imagemPadrao,
        status: evento.status,
    };
}

export async function listarEventos(): Promise<EventoExplorar[]> {
    const resposta = await apiRequest<EventoBackend[]>("eventos", {
        method: "GET",
        cache: "no-store",
    });

    return resposta
        .filter((evento) => evento.status === "APROVADO")
        .map(normalizarEvento);
}

export async function buscarEventoPorId(
    id: number,
): Promise<EventoExplorar> {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error("Identificador de evento inválido.");
    }

    const evento = await apiRequest<EventoBackend>(
        `eventos/${id}`,
        {
            method: "GET",
            cache: "no-store",
        },
    );

    if (evento.status !== "APROVADO") {
        throw new Error("Este evento não está disponível.");
    }

    return normalizarEvento(evento);
}

export type CategoriaBackend = {
    id: number;
    nome: string;
};

export type NovoEvento = {
    titulo: string;
    descricao: string;
    data: string;
    local: string;
    categoriaId?: number;
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

export async function listarCategorias(): Promise<CategoriaBackend[]> {
    const resposta = await apiRequest<CategoriaBackend[]>(
        "categorias",
        {
            method: "GET",
            cache: "no-store",
        },
    );

    if (!Array.isArray(resposta)) {
        throw new Error("Não foi possível carregar as categorias.");
    }

    return resposta;
}

export async function criarEvento(
    dados: NovoEvento,
): Promise<EventoBackend> {
    return apiRequest<EventoBackend>(
        "eventos",
        {
            method: "POST",
            headers: obterHeadersAutenticados(),
            body: JSON.stringify(dados),
        },
    );
}

export async function listarMeusEventos(): Promise<EventoExplorar[]> {
    const resposta = await apiRequest<EventoBackend[]>(
        "eventos/meus",
        {
            method: "GET",
            cache: "no-store",
            headers: obterHeadersAutenticados(),
        },
    );

    if (!Array.isArray(resposta)) {
        throw new Error("A API retornou uma lista de eventos inválida.");
    }

    return resposta.map(normalizarEvento);
}
