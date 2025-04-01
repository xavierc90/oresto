// ReservationsPage.tsx

import { useEffect, useState, useCallback } from "react";
import { ReservationList } from "../Components/Dashboard/ReservationList";
import { formatDateWithoutTime } from "../../Module/Utils/dateFormatterWithoutHour";
import { dateService } from "../../Module/Utils/dateService";
import { http } from "../../Infrastructure/Http/axios.instance";
import { Reservation } from "../../Module/Types";
import { TableReservationArea } from "../Components/Dashboard/TablePlan/TableReservationArea";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { useDashboard } from "../../Module/Context/Dashboard/DashboardContext";

const ReservationsPage = () => {
  const { user, restaurant } = useDashboard();

  // État local pour suivre si les données sont prêtes
  const [dataReady, setDataReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Gérer le chargement global

  // États des filtres
  const [hideCanceled, setHideCanceled] = useState(false);
  const [hideConfirmed, setHideConfirmed] = useState(false);
  const [hideWaiting, setHideWaiting] = useState(false);

  // Fonction pour récupérer les réservations
  const fetchReservations = useCallback(
    async (date: Date) => {
      if (!user || !restaurant) {
        console.error(
          "Utilisateur ou restaurant manquants. Impossible de récupérer les réservations.",
        );
        return;
      }

      try {
        const normalizedDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
        );
        const formattedDate = normalizedDate.toISOString().split("T")[0];

        const response = await http.get(`/reservations/${formattedDate}`, {
          // Le cookie HTTP-only sera automatiquement envoyé avec la requête
          params: {
            userId: user._id,
            restaurantId: restaurant._id,
          },
        });
        setReservations(response.data);
      } catch (error: unknown) {
        console.error(
          "Erreur lors de la récupération des réservations:",
          error,
        );
        if (
          error instanceof Error &&
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          error.response.status === 401
        ) {
          console.error(
            "Non autorisé. Redirection vers la page de connexion...",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [user, restaurant],
  );

  // Vérifier si les données nécessaires sont disponibles
  useEffect(() => {
    // Si les deux sont disponibles, on peut charger les données
    if (user && restaurant) {
      setDataReady(true);
    } else {
      setDataReady(false);
    }
  }, [user, restaurant]);

  // Effet pour charger les réservations et mettre à jour le titre de la page
  useEffect(() => {
    document.title = "Oresto - Réservations";

    // Ne pas essayer de charger les données si user ou restaurant n'est pas disponible
    if (!dataReady) {
      return;
    }

    const subscription = dateService.getDate().subscribe((date) => {
      setSelectedDate(date);
      fetchReservations(date);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dataReady, fetchReservations]);

  // Fonctions de navigation
  const goToPreviousDay = () => {
    if (selectedDate) {
      const prevDate = new Date(selectedDate);
      prevDate.setDate(selectedDate.getDate() - 1);
      dateService.setDate(prevDate); // Utiliser dateService pour émettre la nouvelle date
    }
  };

  const goToNextDay = () => {
    if (selectedDate) {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 1);
      dateService.setDate(nextDate); // Utiliser dateService pour émettre la nouvelle date
    }
  };

  // Calculer les réservations en fonction des filtres
  const filteredReservations = reservations.filter((reservation) => {
    if (hideCanceled && reservation.status === "canceled") return false;
    if (hideConfirmed && reservation.status === "confirmed") return false;
    if (hideWaiting && reservation.status === "waiting") return false;
    return true;
  });

  const totalCovers = filteredReservations.reduce(
    (sum, reservation) => sum + reservation.nbr_persons,
    0,
  );

  const validReservations = filteredReservations.length;

  return (
    <div className="bg-light w-full">
      {!dataReady || loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Chargement des données en cours...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Utilisation de flex pour aligner les blocs à gauche et à droite */}
          <div className="flex justify-between items-start pt-10 pl-10 pr-12">
            {/* Bloc de navigation des dates */}
            <div className="flex items-center">
              {/* Flèche gauche */}
              <button onClick={goToPreviousDay} aria-label="Jour précédent">
                <MdArrowBackIosNew size={20} />
              </button>

              {/* Bloc central avec la date et le nombre de réservations */}
              <div className="ml-4 mr-4">
                <div className="text-sm md:text-lg font-bold">
                  {selectedDate
                    ? formatDateWithoutTime(selectedDate.toISOString())
                    : "Sélectionnez une date"}
                </div>
                <div className="text-sm lg:text-lg mt-1">
                  <span className="font-bold text-red-500 dark:text-white">
                    {validReservations}
                  </span>{" "}
                  réservation{validReservations > 1 ? "s " : " "}|{" "}
                  <span className="font-bold text-red-500 dark:text-white">
                    {totalCovers}
                  </span>{" "}
                  couvert{totalCovers > 1 ? "s " : " "}
                </div>
              </div>

              {/* Flèche droite */}
              <button onClick={goToNextDay} aria-label="Jour suivant">
                <MdArrowForwardIos size={20} />
              </button>
            </div>

            {/* Bloc de droite avec les filtres */}
            <div className="flex flex-col text-sm gap-2">
              <span className="font-semibold">Filtrer par status</span>
              <div className="flex gap-3">
                {/* Filtre pour "Annulées" */}
                <label className="hidden lg:inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hideCanceled}
                    onChange={() => setHideCanceled((prev) => !prev)}
                    className="sr-only peer"
                  />
                  <div
                    className="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
                  after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"
                  ></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Annulées
                  </span>
                </label>

                {/* Filtre pour "En attente" */}
                <label className="hidden lg:inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hideWaiting}
                    onChange={() => setHideWaiting((prev) => !prev)}
                    className="sr-only peer"
                  />
                  <div
                    className="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
                  after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-400"
                  ></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    En attente
                  </span>
                </label>

                {/* Filtre pour "Confirmées" */}
                <label className="hidden lg:inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hideConfirmed}
                    onChange={() => setHideConfirmed((prev) => !prev)}
                    className="sr-only peer"
                  />
                  <div
                    className="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
                  after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-700"
                  ></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Confirmées
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Composants pour la liste des réservations et la gestion des tables */}
          <ReservationList
            reservations={filteredReservations}
            fetchReservations={fetchReservations}
            selectedDate={selectedDate}
          />
          <TableReservationArea
            selectedDate={selectedDate}
            reservations={reservations}
            isOpen={true}
          />
        </>
      )}
    </div>
  );
};

// Exportation nommée pour le composant
export { ReservationsPage };
