
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

type PlanoConsulta = {
    texto: string;
    termosObrigatorios: string[];
    nomeResultado?: string;
};

type AliasLocal = {
    cidade: Cidade;
    nomes: string[];
    consultas: PlanoConsulta[];
};

type LocalizacaoConhecida = {
    cidade: Cidade;
    nomes: string[];
    resultado: ResultadoGeocodificacao;
};

const AREA_LITORAL_NORTE = {
    oeste: -46.2,
    sul: -24.1,
    leste: -44.5,
    norte: -23.0,
};

const TIPOS_ACEITOS = [
    "poi",
    "address",
    "road",
    "place",
    "locality",
    "neighbourhood",
];

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
]);

const TERMOS_LOCAL_GENERICOS = new Set([
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

const CENTROS_CIDADES: Record<Cidade, [number, number]> = {
    Caraguatatuba: [-45.413, -23.6207],
    "São Sebastião": [-45.41, -23.8],
    Ilhabela: [-45.355, -23.778],
    Ubatuba: [-45.083, -23.433],
};

// Locais públicos conhecidos com coordenadas de referência.
// Esses resultados não dependem da indexação do MapTiler.
//
// Praça Cândido Mota:
// Coordenadas geográficas publicadas para a praça.
// Endereço institucional: Praça Dr. Cândido Motta, Centro.
//
// Praça da Cultura:
// Endereço: Av. Dr. Arthur da Costa Filho, 25, Centro.
// Coordenada de referência obtida a partir do mapa do endereço.
// Mantida como APROXIMADA, pois não representa levantamento
// topográfico dos limites exatos da praça.
const LOCALIZACOES_CONHECIDAS: LocalizacaoConhecida[] = [
    {
        cidade: "Caraguatatuba",
        nomes: [
            "praca candido mota",
            "praca candido motta",
            "praca dr candido mota",
            "praca dr candido motta",
            "praca doutor candido mota",
            "praca doutor candido motta",
        ],
        resultado: {
            id: "local-conhecido-praca-candido-mota",
            nome: "Praça Cândido Mota",
            cidade: "Caraguatatuba",
            latitude: -23.6217181,
            longitude: -45.4110897,
            precisaoLocalizacao: "APROXIMADA",
        },
    },
    {
        cidade: "Caraguatatuba",
        nomes: [
            "praca da cultura",
            "praca cultura",
        ],
        resultado: {
            id: "local-conhecido-praca-da-cultura",
            nome: "Praça da Cultura",
            cidade: "Caraguatatuba",
            latitude: -23.6240178,
            longitude: -45.4090815,
            precisaoLocalizacao: "APROXIMADA",
        },
    },
];

// Alias remoto para um local cujo nome conhecido é diferente
// do nome encontrado na base geográfica.
const ALIASES_LOCAIS: AliasLocal[] = [
    {
        cidade: "Ilhabela",
        nomes: [
            "praca de eventos do galera",
            "praca de eventos galera",
        ],
        consultas: [
            {
                texto: "Campo do Galera",
                termosObrigatorios: ["campo", "galera"],
                nomeResultado: "Campo do Galera",
            },
        ],
    },
];

const SINONIMOS_TERMOS: Record<string, string[]> = {
    av: ["av", "avenida"],
    avenida: ["av", "avenida"],
    rod: ["rod", "rodovia"],
    rodovia: ["rod", "rodovia"],
    tv: ["tv", "travessa"],
    travessa: ["tv", "travessa"],
};

function normalizarTexto(valor: string): string {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
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

// Procura primeiro os locais conhecidos e suas variações de escrita.
function obterLocalizacaoConhecida(
    local: string,
    cidade: Cidade,
): ResultadoGeocodificacao | null {
    const nomeNormalizado = normalizarTexto(local);

    const localEncontrado = LOCALIZACOES_CONHECIDAS.find(
        (item) =>
            item.cidade === cidade &&
            item.nomes.some(
                (nome) => normalizarTexto(nome) === nomeNormalizado,
            ),
    );

    return localEncontrado?.resultado ?? null;
}

function obterPlanosConsulta(
    local: string,
    cidade: Cidade,
): PlanoConsulta[] {
    const planos: PlanoConsulta[] = [
        {
            texto: local,
            termosObrigatorios: obterTermosSignificativos(local),
        },
    ];

    const nomeNormalizado = normalizarTexto(local);

    const alias = ALIASES_LOCAIS.find(
        (item) =>
            item.cidade === cidade &&
            item.nomes.some(
                (nome) => normalizarTexto(nome) === nomeNormalizado,
            ),
    );

    if (alias) {
        planos.push(...alias.consultas);
    }

    return planos.filter(
        (plano, indice, todos) =>
            todos.findIndex(
                (outro) =>
                    normalizarTexto(outro.texto) ===
                    normalizarTexto(plano.texto),
            ) === indice,
    );
}

function correspondeNome(
    resultado: MapTilerFeature,
    termosObrigatorios: string[],
): boolean {
    if (termosObrigatorios.length === 0) {
        return false;
    }

    const textos = [
        resultado.text,
        resultado.place_name,
        resultado.matching_text,
        resultado.matching_place_name,
        resultado.address,
    ];

    const palavrasResultado = new Set(
        normalizarTexto(
            textos.filter(Boolean).join(" "),
        )
            .split(/[^a-z0-9]+/)
            .filter(Boolean),
    );

    return termosObrigatorios.every((termo) => {
        const alternativas = SINONIMOS_TERMOS[termo] ?? [termo];

        return alternativas.some((alternativa) =>
            palavrasResultado.has(alternativa),
        );
    });
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

    if (
        contextosMunicipais.some(
            (contexto) =>
                normalizarTexto(contexto.text ?? "") ===
                cidadeNormalizada,
        )
    ) {
        return true;
    }

    // Se a resposta não identificar claramente o município no contexto,
    // tenta validar pelo endereço completo.
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

async function consultarMapTiler(
    plano: PlanoConsulta,
    cidade: Cidade,
    apiKey: string,
): Promise<MapTilerFeature[]> {
    const consulta = `${plano.texto}, ${cidade}, São Paulo, Brasil`;

    const parametros = new URLSearchParams({
        key: apiKey,
        country: "br",
        language: "pt",
        limit: "10",
        autocomplete: "false",
        fuzzyMatch: "true",
        types: TIPOS_ACEITOS.join(","),
        bbox: [
            AREA_LITORAL_NORTE.oeste,
            AREA_LITORAL_NORTE.sul,
            AREA_LITORAL_NORTE.leste,
            AREA_LITORAL_NORTE.norte,
        ].join(","),
        proximity: CENTROS_CIDADES[cidade].join(","),
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

    return dados.features;
}

function filtrarResultados(
    features: MapTilerFeature[],
    plano: PlanoConsulta,
    cidade: Cidade,
): ResultadoGeocodificacao[] {
    return features.flatMap(
        (feature, indice): ResultadoGeocodificacao[] => {
            const tipos = feature.place_type ?? [];

            if (!tipos.some((tipo) => TIPOS_ACEITOS.includes(tipo))) {
                return [];
            }

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

            if (
                !correspondeNome(
                    feature,
                    plano.termosObrigatorios,
                )
            ) {
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
                plano.nomeResultado ??
                feature.place_name?.trim() ??
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
                    precisaoLocalizacao: tipos.includes("poi")
                        ? "EXATA"
                        : "APROXIMADA",
                },
            ];
        },
    );
}

export async function buscarLocalizacoes(
    local: string,
    cidade: Cidade,
): Promise<ResultadoGeocodificacao[]> {
    const localLimpo = local.trim();

    if (localLimpo.length < 3) {
        throw new Error(
            "Informe um endereço ou nome de local mais completo.",
        );
    }

    if (!cidades.includes(cidade)) {
        throw new Error("Selecione uma cidade válida.");
    }

    const termos = obterTermosSignificativos(localLimpo);

    if (
        termos.length === 0 ||
        termos.every((termo) =>
            TERMOS_LOCAL_GENERICOS.has(termo),
        )
    ) {
        throw new Error(
            "Informe também o nome específico do local, estabelecimento ou endereço.",
        );
    }

    // 1. Locais conhecidos: não dependem do MapTiler.
    const localizacaoConhecida = obterLocalizacaoConhecida(
        localLimpo,
        cidade,
    );

    if (localizacaoConhecida) {
        return [localizacaoConhecida];
    }

    // 2. Outros locais: utilizam a geocodificação remota.
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

    if (!apiKey) {
        throw new Error(
            "A chave do MapTiler não está configurada no frontend.",
        );
    }

    const planos = obterPlanosConsulta(localLimpo, cidade);

    for (const plano of planos) {
        const features = await consultarMapTiler(
            plano,
            cidade,
            apiKey,
        );

        const resultados = filtrarResultados(
            features,
            plano,
            cidade,
        );

        if (resultados.length > 0) {
            return resultados;
        }
    }

    return [];
}
