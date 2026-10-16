export type Cidade = "Caraguatatuba" | "São Sebastião" | "Ilhabela" | "Ubatuba";

export type Categoria = "Esporte" | "Cultura" | "Natureza" | "Música" | "Feira";

export type Evento = {
  id: number;
  titulo: string;
  categoria: Categoria;
  data: string;
  hora: string;
  local: string;
  cidade: Cidade;
  gratuito: boolean;
  imagem: string;
};

export const cidades: Cidade[] = ["Caraguatatuba", "São Sebastião", "Ilhabela", "Ubatuba"];

export const categorias: Categoria[] = ["Música", "Cultura", "Esporte", "Natureza", "Feira"];

// Dados de exemplo. Troque por dados reais (API/banco) quando houver.
export const eventos: Evento[] = [
  {
    id: 1,
    titulo: "Festival de Surf",
    categoria: "Esporte",
    data: "30 ago.",
    hora: "19:00",
    local: "Maresias",
    cidade: "São Sebastião",
    gratuito: true,
    imagem: "/image/esportes.jpg",
  },
  {
    id: 2,
    titulo: "Feira da Praia",
    categoria: "Feira",
    data: "02 set.",
    hora: "10:00",
    local: "Centro",
    cidade: "Ubatuba",
    gratuito: false,
    imagem: "/image/feiras.jpg",
  },
  {
    id: 3,
    titulo: "Subida por do sol",
    categoria: "Natureza",
    data: "05 set.",
    hora: "17:00",
    local: "Morro Santo Antônio",
    cidade: "Caraguatatuba",
    gratuito: true,
    imagem: "/image/segunda-img.jpg",
  },
  {
    id: 4,
    titulo: "Show de Aniversário Ilha",
    categoria: "Música",
    data: "02 set.",
    hora: "16:00",
    local: "Praça de Eventos do Galeão",
    cidade: "Ilhabela",
    gratuito: true,
    imagem: "/image/musical.jpg",
  },
  {
    id: 5,
    titulo: "Noite de Cultura Caiçara",
    categoria: "Cultura",
    data: "07 set.",
    hora: "19:30",
    local: "Praça Cândido Mota",
    cidade: "Caraguatatuba",
    gratuito: true,
    imagem: "/image/cultura.jpg",
  },
  {
    id: 6,
    titulo: "Trilha das Cachoeiras",
    categoria: "Natureza",
    data: "09 set.",
    hora: "08:00",
    local: "Praia da Almada",
    cidade: "Ubatuba",
    gratuito: true,
    imagem: "/image/terceira-img.jpg",
  },
];