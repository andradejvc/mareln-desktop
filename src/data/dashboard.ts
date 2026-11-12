
import type { EventoExplorar } from "@/lib/eventos-api";

export type CategoriaDashboard = string;

export type EventoDashboard = EventoExplorar & {
    hoje: boolean;
};
