import { Table } from "./table.type"; 

export type TablePlan = {
  _id: string;
  date: string;
  restaurant_id: string;
  tables: {
    table_id: Table;
    number: string;  // Correctif : c'est un string (ou number si besoin)
    capacity: number;
    shape: "rectangle" | "square" | "round";
    position_x: number;
    position_y: number;
  }[];
};
