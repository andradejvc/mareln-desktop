export type PrecisaoCoordenada = "referencia" | "aproximada";

export type CoordenadaEvento = {
  latitude: number;
  longitude: number;
  precisao: PrecisaoCoordenada;
  observacao?: string;
};

/**
 * Coordenadas de referência para a demonstração do mapa.
 * Alguns cadastros atuais têm locais amplos ou nomes genéricos; nesses casos,
 * o marcador é deliberadamente identificado como aproximado na interface.
 * Ao integrar os eventos reais pela API, essas coordenadas devem vir do backend.
 */
export const coordenadasEventos: Record<number, CoordenadaEvento> = {
  // Praia Grande — ponto de referência da praia, não um ponto de palco específico.
  1: {
    latitude: -23.4727,
    longitude: -45.0665,
    precisao: "referencia",
    observacao: "Ponto de referência da Praia Grande.",
  },
  // Praça Cândido Mota, Caraguatatuba.
  2: {
    latitude: -23.6217181,
    longitude: -45.4110897,
    precisao: "referencia",
  },
  // Praça de Eventos do Galera — aproximação da região do complexo, pendente de coordenada oficial do evento.
  3: {
    latitude: -23.8015,
    longitude: -45.356,
    precisao: "aproximada",
    observacao: "Região do Complexo do Galera; confirme o ponto exato com a organização.",
  },
  // Parque Estadual da Serra do Mar é uma área extensa; o percurso exato não consta no cadastro.
  4: {
    latitude: -23.3827,
    longitude: -45.0827,
    precisao: "aproximada",
    observacao: "Referência regional do Parque Estadual; o ponto exato depende do percurso.",
  },
  // Praia de Maresias — ponto de referência da praia.
  5: {
    latitude: -23.7931,
    longitude: -45.571,
    precisao: "referencia",
    observacao: "Ponto de referência da Praia de Maresias.",
  },
  // Referência no Centro de São Sebastião: o cadastro informa apenas "Centro Cultural".
  6: {
    latitude: -23.802663,
    longitude: -45.398983,
    precisao: "aproximada",
    observacao: "Referência de um centro cultural na região central; confirme o endereço exato do evento.",
  },
  // O nome "Praia da Vila" no cadastro não identifica um endereço verificável em Ubatuba.
  7: {
    latitude: -23.43476,
    longitude: -45.07324,
    precisao: "aproximada",
    observacao: "Referência no Centro de Ubatuba; o cadastro precisa do nome/endereço exato da praia.",
  },
  // Praça da Cultura, Av. Dr. Arthur da Costa Filho, Centro de Caraguatatuba.
  8: {
    latitude: -23.6207,
    longitude: -45.4095,
    precisao: "aproximada",
    observacao: "Referência aproximada da Praça da Cultura, na avenida da praia.",
  },
  // Festival de Surf em Maresias — mesma área de referência do evento 5.
  9: {
    latitude: -23.7931,
    longitude: -45.571,
    precisao: "referencia",
    observacao: "Ponto de referência da Praia de Maresias.",
  },
  // "Centro" não possui endereço mais específico no cadastro.
  10: {
    latitude: -23.43476,
    longitude: -45.07324,
    precisao: "aproximada",
    observacao: "Referência do Centro de Ubatuba; falta o endereço específico da feira.",
  },
  // Morro Santo Antônio, Caraguatatuba.
  11: {
    latitude: -23.60972,
    longitude: -45.40118,
    precisao: "referencia",
  },
  // Mesmo complexo do evento 3.
  12: {
    latitude: -23.8015,
    longitude: -45.356,
    precisao: "aproximada",
    observacao: "Região do Complexo do Galera; confirme o ponto exato com a organização.",
  },
  // Praça Cândido Mota, Caraguatatuba.
  13: {
    latitude: -23.6217181,
    longitude: -45.4110897,
    precisao: "referencia",
  },
  // Praia da Almada — coordenada divulgada pela Prefeitura de Ubatuba.
  14: {
    latitude: -23.3611,
    longitude: -44.8887,
    precisao: "referencia",
    observacao: "Ponto de referência da Praia da Almada.",
  },
};
