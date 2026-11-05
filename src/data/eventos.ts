export type Cidade =
  | "Caraguatatuba"
  | "São Sebastião"
  | "Ilhabela"
  | "Ubatuba";

export type Categoria =
  | "Esporte"
  | "Cultura"
  | "Natureza"
  | "Música"
  | "Feira"
  | "Gastronomia";

export type Evento = {
  id: number;
  titulo: string;
  categoria: Categoria;
  data: string;
  hora: string;
  local: string;
  cidade: Cidade;
  gratuito?: boolean;
  imagem: string;
  hoje?: boolean;
  mostrarNoDashboard?: boolean;
};

export const cidades: Cidade[] = [
  "Caraguatatuba",
  "São Sebastião",
  "Ilhabela",
  "Ubatuba",
];

export const categorias: Categoria[] = [
  "Música",
  "Cultura",
  "Esporte",
  "Natureza",
  "Feira",
  "Gastronomia",
];

// Fonte única de eventos utilizada pelo Dashboard e pelo Explorar.
export const eventos: Evento[] = [
  // Eventos exibidos no Dashboard
  {
    id: 1,
    titulo: "Festival de Jazz na Praia",
    categoria: "Música",
    data: "28 de ago.",
    hora: "18:00",
    local: "Praia Grande de Ubatuba",
    cidade: "Ubatuba",
    imagem: "/image/musical.jpg",
    hoje: true,
    mostrarNoDashboard: true,
  },
  {
    id: 2,
    titulo: "Feira de Artesanato Local",
    categoria: "Feira",
    data: "28 de ago.",
    hora: "09:00",
    local: "Praça Cândido Mota",
    cidade: "Caraguatatuba",
    imagem: "/image/feiras.jpg",
    hoje: true,
    mostrarNoDashboard: true,
  },
  {
    id: 3,
    titulo: "Noite de Forró Pé de Serra",
    categoria: "Música",
    data: "29 de ago.",
    hora: "20:00",
    local: "Praça de Eventos do Galeão",
    cidade: "Ilhabela",
    imagem: "/image/musical.jpg",
    mostrarNoDashboard: true,
  },
  {
    id: 4,
    titulo: "Caminhada Ecológica na Mata",
    categoria: "Natureza",
    data: "30 de ago.",
    hora: "07:00",
    local: "Parque Estadual da Serra do Mar",
    cidade: "Ubatuba",
    imagem: "/image/terceira-img.jpg",
    mostrarNoDashboard: true,
  },
  {
    id: 5,
    titulo: "Torneio de Vôlei de Praia",
    categoria: "Esporte",
    data: "31 de ago.",
    hora: "10:00",
    local: "Praia de Maresias",
    cidade: "São Sebastião",
    imagem: "/image/esportes.jpg",
    mostrarNoDashboard: true,
  },
  {
    id: 6,
    titulo: "Exposição de Arte Marinha",
    categoria: "Cultura",
    data: "01 de set.",
    hora: "14:00",
    local: "Centro Cultural",
    cidade: "São Sebastião",
    imagem: "/image/cultura.jpg",
    mostrarNoDashboard: true,
  },
  {
    id: 7,
    titulo: "Aula Aberta de Surf",
    categoria: "Esporte",
    data: "02 de set.",
    hora: "08:00",
    local: "Praia da Vila",
    cidade: "Ubatuba",
    imagem: "/image/primeira-img.jpg",
    mostrarNoDashboard: true,
  },
  {
    id: 8,
    titulo: "Mercado Gastronômico",
    categoria: "Gastronomia",
    data: "03 de set.",
    hora: "11:00",
    local: "Praça da Cultura",
    cidade: "Caraguatatuba",
    imagem: "/image/segunda-img.jpg",
    mostrarNoDashboard: true,
  },

  // Eventos que já existiam em Explorar
  // IDs alterados para não entrar em conflito com os eventos acima.
  {
    id: 9,
    titulo: "Festival de Surf",
    categoria: "Esporte",
    data: "30 de ago.",
    hora: "19:00",
    local: "Maresias",
    cidade: "São Sebastião",
    gratuito: true,
    imagem: "/image/esportes.jpg",
  },
  {
    id: 10,
    titulo: "Feira da Praia",
    categoria: "Feira",
    data: "02 de set.",
    hora: "10:00",
    local: "Centro",
    cidade: "Ubatuba",
    gratuito: false,
    imagem: "/image/feiras.jpg",
  },
  {
    id: 11,
    titulo: "Subida por do sol",
    categoria: "Natureza",
    data: "05 de set.",
    hora: "17:00",
    local: "Morro Santo Antônio",
    cidade: "Caraguatatuba",
    gratuito: true,
    imagem: "/image/segunda-img.jpg",
  },
  {
    id: 12,
    titulo: "Show de Aniversário Ilha",
    categoria: "Música",
    data: "02 de set.",
    hora: "16:00",
    local: "Praça de Eventos do Galeão",
    cidade: "Ilhabela",
    gratuito: true,
    imagem: "/image/musical.jpg",
  },
  {
    id: 13,
    titulo: "Noite de Cultura Caiçara",
    categoria: "Cultura",
    data: "07 de set.",
    hora: "19:30",
    local: "Praça Cândido Mota",
    cidade: "Caraguatatuba",
    gratuito: true,
    imagem: "/image/cultura.jpg",
  },
  {
    id: 14,
    titulo: "Trilha das Cachoeiras",
    categoria: "Natureza",
    data: "09 de set.",
    hora: "08:00",
    local: "Praia da Almada",
    cidade: "Ubatuba",
    gratuito: true,
    imagem: "/image/terceira-img.jpg",
  },
];

// Lista inicial compartilhada pelas duas telas.
// A persistência definitiva será implementada na próxima etapa de favoritos.
export const favoritosIniciais = [1, 3, 6];