import type { Cidade } from "@/data/eventos";

export type CategoriaDashboard =
  | "Música"
  | "Feiras"
  | "Natureza"
  | "Esportes"
  | "Cultura"
  | "Gastronomia";

export type EventoDashboard = {
  id: number;
  titulo: string;
  categoria: CategoriaDashboard;
  /** Ex.: "29 de ago." */
  data: string;
  hora: string;
  local: string;
  cidade: Cidade;
  imagem: string;
  hoje?: boolean;
};

// Dados de exemplo. Troque por dados reais (API/banco) quando houver.
export const usuario = { nome: "Marina" };

export const dataDeHoje = "Quinta-feira, 28 de agosto";

export const eventosDashboard: EventoDashboard[] = [
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
  },
  {
    id: 2,
    titulo: "Feira de Artesanato Local",
    categoria: "Feiras",
    data: "28 de ago.",
    hora: "09:00",
    local: "Praça Cândido Mota",
    cidade: "Caraguatatuba",
    imagem: "/image/feiras.jpg",
    hoje: true,
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
  },
  {
    id: 5,
    titulo: "Torneio de Vôlei de Praia",
    categoria: "Esportes",
    data: "31 de ago.",
    hora: "10:00",
    local: "Praia de Maresias",
    cidade: "São Sebastião",
    imagem: "/image/esportes.jpg",
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
  },
  {
    id: 7,
    titulo: "Aula Aberta de Surf",
    categoria: "Esportes",
    data: "02 de set.",
    hora: "08:00",
    local: "Praia da Vila",
    cidade: "Ubatuba",
    imagem: "/image/primeira-img.jpg",
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
  },
];

export const favoritosIniciais = [1, 3, 6];
export const sugestoesIds = [4, 6, 8];