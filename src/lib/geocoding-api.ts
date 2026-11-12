
import { cidades, type Cidade } from "@/data/eventos";

export type PrecisaoGeocodificacao = "EXATA" | "APROXIMADA";

export type ResultadoGeocodificacao = {
    id: string;
    nome: string;
    cidade: Cidade;
    latitude: number;
    longitude: number;
    precisaoLocalizacao: PrecisaoGeocodificacao;
};

type MapTilerContext = {
    id?: string;
    text?: string;
    place_designation?: string;
    country_code?: string;
};

type MapTilerFeature = {
    id?: string;
    text?: string;
    place_name?: string;
    matching_place_name?: string;
    matching_text?: string;
    address?: string;
    place_type?: string[];
    relevance?: number;
    center?: number[];
    geometry?: {
        coordinates?: number[];
    };
    properties?: {
        country_code?: string;
    };
    context?: MapTilerContext[];
};

type MapTilerResposta = {
    features?: MapTilerFeature[];
};

const AREA_LITORAL_NORTE = {
    oeste: -46.2,
    sul: -24.1,
    leste: -44.5,
    norte: -23.0,
};

const TIPOS_ACEITOS = ["poi", "address", "road"];

const TERMOS_IGNORADOS = new Set([
    "a",
    "as",
    "o",
    "os",
    "e",
    "de",
    "da",
    "das",
    "do",
    "dos",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "praça",
    "praca",
    "rua",
    "avenida",
    "av",
    "travessa",
    "rodovia",
    "estrada",
    "bairro",
    "centro",
    "praia",
    "parque",
    "municipal",
]);

function normalizarTexto(valor: string): string {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obterTermosSignificativos(valor: string): string[] {
    return [
        ...new Set(
            normalizarTexto(valor)
                .split(/[^a-z0-9]+/)
                .filter(
                    (termo) =>
                        termo.length >= 2 &&
                        !TERMOS_IGNORADOS.has(termo),
                ),
        ),
    ];
}

function correspondeNome(
    resultado: MapTilerFeature,
    localPesquisado: string,
): boolean {
    const termos = obterTermosSignificativos(localPesquisado);

    // Evita aceitar pesquisas genéricas demais.
    if (termos.length === 0) {
        return false;
    }

    const textos = [
        resultado.text,
        resultado.place_name,
        resultado.matching_text,
        resultado.matching_place_name,
        resultado.address,
    ];

    const textoResultado = normalizarTexto(
        textos.filter(Boolean).join(" "),
    );

    const palavrasResultado = new Set(
        textoResultado.split(/[^a-z0-9]+/).filter(Boolean),
    );

    // Todos os termos relevantes precisam aparecer no resultado.
    return termos.every((termo) =>
        palavrasResultado.has(termo),
    );
}

function correspondeCidade(
    resultado: MapTilerFeature,
    cidade: Cidade,
): boolean {
    const cidadeNormalizada = normalizarTexto(cidade);

    const contextosMunicipais = (resultado.context ?? []).filter(
        (contexto) => {
            const id = contexto.id ?? "";
            const designacao = normalizarTexto(
                contexto.place_designation ?? "",
            );

            return (
                /^(municipality|joint_municipality)\./i.test(id) ||
                designacao === "city"
            );
        },
    );

    // Quando a API fornece o município no contexto,
    // esse dado tem prioridade sobre o nome completo do resultado.
    if (contextosMunicipais.length > 0) {
        return contextosMunicipais.some(
            (contexto) =>
                normalizarTexto(contexto.text ?? "") ===
                cidadeNormalizada,
        );
    }

    // Alternativa: verificar os segmentos do endereço completo.
    const segmentos = [
        resultado.place_name,
        resultado.matching_place_name,
    ]
        .filter((valor): valor is string => Boolean(valor))
        .flatMap((valor) => valor.split(","))
        .map((valor) => normalizarTexto(valor));

    return segmentos.includes(cidadeNormalizada);
}

function correspondePais(resultado: MapTilerFeature): boolean {
    const codigoPais =
        resultado.properties?.country_code ??
        (resultado.context ?? []).find(
            (contexto) => contexto.id?.startsWith("country."),
        )?.country_code;

    return !codigoPais || codigoPais.toLowerCase() === "br";
}

function estaNoLitoralNorte(
    longitude: number,
    latitude: number,
): boolean {
    return (
        longitude >= AREA_LITORAL_NORTE.oeste &&
        longitude <= AREA_LITORAL_NORTE.leste &&
        latitude >= AREA_LITORAL_NORTE.sul &&
        latitude <= AREA_LITORAL_NORTE.norte
    );
}

export async function buscarLocalizacoes(
    local: string,
    cidade: Cidade,
): Promise<ResultadoGeocodificacao[]> {
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

    if (!apiKey) {
        throw new Error(
            "A chave do MapTiler não está configurada no frontend.",
        );
    }

    const localLimpo = local.trim();

    if (localLimpo.length < 3) {
        throw new Error(
            "Informe um endereço ou nome de local mais completo.",
        );
    }

    if (!cidades.includes(cidade)) {
        throw new Error("Selecione uma cidade válida.");
    }

    if (obterTermosSignificativos(localLimpo).length === 0) {
        throw new Error(
            "Informe um nome mais específico para encontrar a localização.",
        );
    }

    const consultaLocal = /^praca\b/.test(normalizarTexto(localLimpo))
        ? obterTermosSignificativos(localLimpo).join(" ")
        : localLimpo;

    const consulta = `${consultaLocal}, ${cidade}, São Paulo, Brasil`;

    const parametros = new URLSearchParams({
        key: apiKey,
        country: "br",
        language: "pt",
        limit: "10",
        autocomplete: "false",
        fuzzyMatch: "false",
        types: TIPOS_ACEITOS.join(","),
        bbox: [
            AREA_LITORAL_NORTE.oeste,
            AREA_LITORAL_NORTE.sul,
            AREA_LITORAL_NORTE.leste,
            AREA_LITORAL_NORTE.norte,
        ].join(","),
    });

    const url =
        `https://api.maptiler.com/geocoding/${encodeURIComponent(consulta)}.json?${parametros}`;

    const resposta = await fetch(url, {
        method: "GET",
        cache: "no-store",
    });

    if (!resposta.ok) {
        if (resposta.status === 403) {
            throw new Error(
                "O MapTiler recusou a chave. Verifique se ela está válida e se o serviço de geocodificação está permitido.",
            );
        }

        if (resposta.status === 429) {
            throw new Error(
                "O limite de consultas de localização foi atingido. Tente novamente mais tarde.",
            );
        }

        throw new Error(
            "Não foi possível consultar o serviço de localização.",
        );
    }

    const dados = (await resposta.json()) as MapTilerResposta;

    if (!Array.isArray(dados.features)) {
        throw new Error(
            "O serviço de localização retornou uma resposta inválida.",
        );
    }

    const resultados = dados.features.flatMap(
        (feature, indice): ResultadoGeocodificacao[] => {
            const tipos = feature.place_type ?? [];

            // Aceita somente pontos de interesse, endereços e vias.
            if (!tipos.some((tipo) => TIPOS_ACEITOS.includes(tipo))) {
                return [];
            }

            // Descarta resultados com baixa relevância, quando informada.
            if (
                typeof feature.relevance === "number" &&
                feature.relevance < 0.5
            ) {
                return [];
            }

            if (!correspondePais(feature)) {
                return [];
            }

            if (!correspondeCidade(feature, cidade)) {
                return [];
            }

            if (!correspondeNome(feature, localLimpo)) {
                return [];
            }

            const coordenadas =
                feature.center ?? feature.geometry?.coordinates;

            if (!coordenadas || coordenadas.length < 2) {
                return [];
            }

            const longitude = coordenadas[0];
            const latitude = coordenadas[1];

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number" ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                return [];
            }

            if (!estaNoLitoralNorte(longitude, latitude)) {
                return [];
            }

            const nome =
                feature.place_name?.trim() ||
                feature.text?.trim();

            if (!nome) {
                return [];
            }

            return [
                {
                    id: feature.id ?? `${nome}-${indice}`,
                    nome,
                    cidade,
                    latitude,
                    longitude,

                    // POIs são representados como pontos específicos.
                    // Endereços e vias ficam como aproximação por segurança.
                    precisaoLocalizacao: tipos.includes("poi")
                        ? "EXATA"
                        : "APROXIMADA",
                },
            ];
        },
    );

    return resultados;
}
