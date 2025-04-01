import { useEffect, useState, useCallback } from "react";
import { TablePlanArea } from "../Components/Dashboard/TablePlan/TablePlanArea";
import { TableForm } from "../Components/Dashboard/TablePlan/TableForm";
import { useAuth } from "../../Module/Auth/useAuth";
import { http } from "../../Infrastructure/Http/axios.instance";
import { Table } from "../../Module/Types";
import { useDashboard } from "../../Module/Context/Dashboard/DashboardContext";

export const TablePlanPage = () => {
  // Utiliser le contexte Dashboard
  const { restaurant, tables: contextTables, updateTables } = useDashboard();
  const { company } = useAuth(); // Utiliser company du useAuth comme fallback

  // Utiliser le restaurant du contexte ou celui de useAuth
  const effectiveRestaurant = restaurant || company;

  const [tables, setTables] = useState<Table[]>(contextTables || []);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtrer les tables qui ne sont pas en statut "archived"
  const availableTables = tables.filter((table) => table.status !== "archived");

  const totalTables = availableTables.length;
  const totalSeats = availableTables.reduce(
    (acc, table) => acc + table.capacity,
    0,
  );

  const fetchTables = useCallback(async () => {
    if (!effectiveRestaurant) {
      console.log("Pas de restaurant disponible pour charger les tables");
      return;
    }

    // Si restaurant est un tableau, on en récupère le premier élément
    const restaurantObject = Array.isArray(effectiveRestaurant)
      ? effectiveRestaurant[0]
      : effectiveRestaurant;

    console.log(
      "Chargement des tables pour le restaurant:",
      restaurantObject._id,
    );

    try {
      setLoading(true);
      const response = await http.get(
        `/tables_by_filters?restaurant_id=${restaurantObject._id}`,
      );

      console.log("Réponse de l'API tables:", response.data);

      // Vérifier que data.results est un tableau
      if (response.data && Array.isArray(response.data.results)) {
        setTables(response.data.results);
        if (updateTables) {
          updateTables(response.data.results);
        }
      }
    } catch (error: Error | unknown) {
      console.error(
        "Erreur lors de la récupération des tables:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      setLoading(false);
    }
  }, [effectiveRestaurant, updateTables]);

  useEffect(() => {
    document.title = "Oresto - Plan de table";
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (contextTables && contextTables.length > 0) {
      setTables(contextTables);
    }
  }, [contextTables]);

  const handleTablesUpdate = () => {
    fetchTables();
  };

  if (!effectiveRestaurant) {
    return <p>Chargement des données du restaurant...</p>;
  }

  if (loading && tables.length === 0) {
    return <p>Chargement du plan de table...</p>;
  }

  // Déterminer l'objet restaurant (si jamais 'restaurant' est un tableau)
  const restaurantObject = Array.isArray(effectiveRestaurant)
    ? effectiveRestaurant[0]
    : effectiveRestaurant;

  return (
    <div className="bg-light w-full">
      <h1 className="text-xl font-bold pt-10 pl-10">Plan de table</h1>
      <h2 className="text-lg pl-10 mt-1">
        <span className="font-bold text-red-500 dark:text-white">
          {totalTables}
        </span>{" "}
        table(s) enregistrée(s) |{" "}
        <span className="font-bold text-red-500 dark:text-white">
          {totalSeats}
        </span>{" "}
        couvert(s)
      </h2>
      {/* Formulaire de création de table */}
      <TableForm
        onTableCreated={handleTablesUpdate}
        restaurant={restaurantObject}
      />
      {/* Zone du plan de table */}
      <TablePlanArea
        restaurant={restaurantObject}
        tables={availableTables}
        onTablesUpdate={handleTablesUpdate}
      />
    </div>
  );
};
