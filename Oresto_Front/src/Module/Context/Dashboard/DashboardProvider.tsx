import { ReactNode, useState, useEffect, useCallback } from "react";
import { http } from "../../../Infrastructure/Http/axios.instance";
import { User } from "../../Auth/user.type";
import { Restaurant, Table } from "../../Types";
import { DashboardContext } from "./DashboardContext";
import { useAuth } from "../../Auth/useAuth";

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  // Initialiser les états à partir de localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Erreur lors du chargement de l'utilisateur:", e);
      return null;
    }
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    try {
      const stored = localStorage.getItem("company");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Erreur lors du chargement du restaurant:", e);
      return null;
    }
  });

  const [tables, setTables] = useState<Table[] | null>(null);

  const { isAuthenticated } = useAuth();
  const userIdFromStorage = localStorage.getItem("userId");

  // Fonctions de mise à jour qui persistent en localStorage
  const updateUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("userId", newUser._id);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    }
  }, []);

  const updateRestaurant = useCallback((newRestaurant: Restaurant | null) => {
    setRestaurant(newRestaurant);
    if (newRestaurant) {
      localStorage.setItem("company", JSON.stringify(newRestaurant));
    } else {
      localStorage.removeItem("company");
    }
  }, []);

  const updateTables = useCallback((newTables: Table[] | null) => {
    setTables(newTables);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userIdFromStorage) {
      return;
    }

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Récupération des données utilisateur
        const userResponse = await http.get<User>(
          `/find_user/${userIdFromStorage}`,
          { headers },
        );
        updateUser(userResponse.data);

        // Si l'utilisateur a un restaurant, récupérer les informations du restaurant
        if (userResponse.data && userResponse.data.company_id) {
          const restaurantResponse = await http.get<Restaurant>(
            `/find_restaurant/${userResponse.data.company_id}`,
            { headers },
          );
          updateRestaurant(restaurantResponse.data);

          // Récupérer les tables du restaurant
          if (restaurantResponse.data && restaurantResponse.data._id) {
            try {
              const tablesResponse = await http.get<Table[]>(
                `/tables/restaurant/${restaurantResponse.data._id}`,
                { headers },
              );
              updateTables(tablesResponse.data);
            } catch (error) {
              console.error(
                "Erreur lors de la récupération des tables:",
                error,
              );
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, [
    isAuthenticated,
    userIdFromStorage,
    updateUser,
    updateRestaurant,
    updateTables,
  ]);

  return (
    <DashboardContext.Provider
      value={{
        user,
        restaurant,
        tables,
        updateUser,
        updateRestaurant,
        updateTables,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
