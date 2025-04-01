import { useState, useEffect } from "react";
import { http } from "../../Infrastructure/Http/axios.instance";
import { BiErrorCircle } from "react-icons/bi";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { Loader } from "../Components/Loader";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ReservationStatistics {
  totalReservations: number;
  statusCounts: {
    confirmed: number;
    waiting: number;
    canceled: number;
  };
  mostReservedTables: Array<{ tableNumber: string; reservations: number }>;
  mostReservedCapacities: Array<{ persons: number; reservations: number }>;
}

export const AnalyticsPage = () => {
  const [statistics, setStatistics] = useState<ReservationStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtenez le nom du mois en cours
  const currentMonth = new Date().toLocaleString("fr-FR", { month: "long" });

  useEffect(() => {
    document.title = "Oresto - Statistiques";

    const fetchStatistics = async () => {
      try {
        const response = await http.get("/reservations");
        const data: ReservationStatistics = response.data || {};

        // Vérifier l'existence des tableaux, sinon les initialiser à un tableau vide
        if (!Array.isArray(data.mostReservedTables)) {
          data.mostReservedTables = [];
        }
        if (!Array.isArray(data.mostReservedCapacities)) {
          data.mostReservedCapacities = [];
        }

        // Trier les tables et capacités par nombre de réservations décroissant
        data.mostReservedTables.sort((a, b) => b.reservations - a.reservations);
        data.mostReservedCapacities.sort(
          (a, b) => b.reservations - a.reservations,
        );

        setStatistics(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError("Erreur lors de la récupération des statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const isDataAvailable = statistics && statistics.totalReservations > 0;

  const doughnutData = {
    labels: ["Confirmées", "En attente", "Annulées"],
    datasets: [
      {
        label: "Réservations",
        data: [
          statistics?.statusCounts.confirmed || 0,
          statistics?.statusCounts.waiting || 0,
          statistics?.statusCounts.canceled || 0,
        ],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
        hoverOffset: 4,
        borderWidth: 0, // Retirer la bordure blanche
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        display: false, // Désactiver la légende
      },
    },
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="bg-light dark:bg-gray-900 dark:text-white w-full min-h-screen pl-10 flex flex-col">
      <div className="pt-10 pb-7">
        <h1 className="text-xl font-bold">Statistiques</h1>
        <h2 className="text-lg mt-1 mb-2">
          Consultez les statistiques de votre restaurant
        </h2>
      </div>

      {isDataAvailable ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
          {/* Colonne pour le nombre total de réservations et le graphique */}
          <div className="flex flex-col gap-4">
            {/* Card pour le total des réservations ce mois-ci */}
            <div className="p-8 bg-white dark:bg-gray-800 rounded shadow-md flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold">
                Total des réservations confirmées
              </h2>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                Mois de {currentMonth}
              </p>
              <p
                className={`text-7xl font-semibold my-5 ${
                  statistics?.statusCounts.confirmed > 0
                    ? "text-green-600"
                    : "text-black dark:text-gray-400"
                }`}
              >
                {statistics?.statusCounts.confirmed || 0}
              </p>
            </div>

            {/* Card pour le graphique Doughnut */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-md flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4">
                Réservations par statut
              </h2>
              <ul className="mt-4 space-y-1 text-lg flex items-center justify-center gap-8 mb-7 font-bold">
                <li className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaCheckCircle color="#4CAF50" /> Confirmées :{" "}
                  <span className="font-semibold text-green-700 dark:text-green-500">
                    {statistics?.statusCounts.confirmed || 0}
                  </span>
                </li>
                <li className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaClock color="#FF9800" />
                  En attente :{" "}
                  <span className="font-semibold text-orange-500">
                    {statistics?.statusCounts.waiting || 0}
                  </span>
                </li>
                <li className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaTimesCircle color="#F44336" />
                  No show :{" "}
                  <span className="font-semibold text-red-500">
                    {statistics?.statusCounts.canceled || 0}
                  </span>
                </li>
              </ul>
              <div className="w-72 h-72">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Colonne pour les tableaux de classement */}
          <div className="flex flex-col gap-4">
            {/* Classement des tables les plus réservées */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-md">
              <h2 className="text-lg font-bold mb-4">Tables les + réservées</h2>
              <table className="w-full text-left table-auto dark:text-gray-900 dark:bg-gray-800">
                <thead className="dark:bg-gray-800">
                  <tr className="bg-gray-200 dark:bg-gray-900">
                    <th className="px-4 py-2 dark:bg-gray-900 dark:text-white text-center">
                      Tables
                    </th>
                    <th className="px-4 py-2 dark:bg-gray-900 dark:text-white text-center">
                      Réservations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics?.mostReservedTables.map((table, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-gray-100 dark:bg-dark-800"
                          : "dark:bg-dark-700"
                      }
                    >
                      <td className="border dark:border-gray-700 dark:text-white text-center px-4 py-2">
                        {table.tableNumber || "Non spécifié"}
                      </td>
                      <td className="border dark:border-gray-700 dark:text-white px-4 py-2 text-center">
                        {table.reservations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Capacités les plus réservées */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-md">
              <h2 className="text-lg font-bold mb-4">
                Capacités les + réservées
              </h2>
              <table className="w-full text-left table-auto dark:text-gray-200">
                <thead>
                  <tr className="bg-gray-200 dark:bg-dark-600">
                    <th className="px-4 py-2 dark:bg-gray-900 dark:text-white text-center">
                      Couverts
                    </th>
                    <th className="px-4 py-2 dark:bg-gray-900 dark:text-white text-center">
                      Réservations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics?.mostReservedCapacities.map((capacity, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-gray-100 dark:bg-dark-800"
                          : "dark:bg-dark-700"
                      }
                    >
                      <td className="border dark:border-gray-700 px-4 py-2 text-center">
                        {capacity.persons} couverts
                      </td>
                      <td className="border dark:border-gray-700 px-4 py-2 text-center">
                        {capacity.reservations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <p className="flex flex-col justify-center items-center text-2xl font-bold text-gray-500 dark:text-gray-300 gap-2">
            <BiErrorCircle size={80} color="#d8d8d8" />
            Aucune donnée disponible
          </p>
          <article className="text-xl pt-1 dark:text-gray-400">
            Les données seront consultables dès qu'une réservation sera faite
            sur votre restaurant
          </article>
        </div>
      )}
    </div>
  );
};
