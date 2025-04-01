/**
 * Fichier centralisant l'exportation des types pour tout le projet
 *
 * Importer les types depuis ce fichier:
 * import { Restaurant, Table, Reservation } from 'path/to/Module/Types';
 */

// Exporter tous les types
export type { Restaurant } from "./restaurant.type";
export type { Table, TableId } from "./table.type";
export type { Reservation } from "./reservation.type";
export type { Company } from "./company.type";
export type { TableStatus } from "./tableStatus.type";
export type { TablePlan } from "./tableplan.type";

// Inclure les déclarations
import "./declarations";
