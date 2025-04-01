import { createContext, useContext } from "react";
import { User } from "../../Auth/user.type";
import { Restaurant, Table } from "../../Types";

export interface DashboardContextType {
  user: User | null;
  restaurant: Restaurant | null;
  tables: Table[] | null;
  updateUser: (user: User | null) => void;
  updateRestaurant: (restaurant: Restaurant | null) => void;
  updateTables: (tables: Table[] | null) => void;
}

// Création du contexte avec une valeur par défaut
export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
