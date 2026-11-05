import {
  eventos,
  type Categoria,
  type Evento,
} from "@/data/eventos";

export type CategoriaDashboard = Categoria;

export type EventoDashboard = Evento;

// Nome provisório mantido por compatibilidade com o projeto.
export const usuario = { nome: "Marina" };

export const dataDeHoje = "Quinta-feira, 28 de agosto";

// O Dashboard utiliza os mesmos eventos cadastrados em eventos.ts.
// Apenas os eventos marcados com mostrarNoDashboard aparecem nele.
export const eventosDashboard = eventos.filter(
  (evento) => evento.mostrarNoDashboard,
);

// Reexporta a lista inicial compartilhada.
export { favoritosIniciais } from "@/data/eventos";

// Eventos recomendados na seção "Pode te interessar".
export const sugestoesIds = [4, 6, 8];