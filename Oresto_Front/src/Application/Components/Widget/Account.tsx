import React, { useState, useEffect } from "react";
import ArrowButton from "../Widget/Form/ArrowButton";
import CloseButton from "../Widget/Form/CloseButton";
import { Booking } from "../Widget/Booking";
import { useAuth } from "../../../Module/Auth/useAuth";
import { UserSettings } from "./Settings/UserSettings";
import { http } from "../../../Infrastructure/Http/axios.instance";

type Reservation = {
  _id: string;
  date_selected: string;
  time_selected: string;
  nbr_persons: number;
  status: string;
  table_number?: string;
  details?: string;
};

type AccountProps = {
  setIsLoging: (value: boolean) => void;
  isContentVisible: boolean;
  setIsContentVisible: (visible: boolean) => void;
  setShowWidget: (visible: boolean) => void;
  handleLogout: () => void;
  restaurantId: string;
};

export const Account: React.FC<AccountProps> = ({
  setIsLoging,
  isContentVisible,
  setIsContentVisible,
  setShowWidget,
  handleLogout,
  restaurantId,
}) => {
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user?._id) {
          setError("Utilisateur non trouvé");
          return;
        }

        const response = await http.get(`/reservations/user/${user._id}`);
        // Filtrer les réservations pour ne garder que celles en attente ou confirmées
        const filteredReservations = (response.data || []).filter(
          (reservation: Reservation) =>
            reservation.status === "waiting" ||
            reservation.status === "confirmed",
        );
        setReservations(filteredReservations);
      } catch (err) {
        setError("Erreur lors de la récupération des réservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user?._id]); // Ajout de la dépendance user._id

  const handleClose = () => {
    setShowWidget(false);
  };

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsLoging(true);
  };

  const handleTimeSelected = () => {
    setShowBooking(false);
  };

  const handleManageAccountClick = () => {
    setShowUserSettings(true);
    setShowBooking(false);
  };

  const handleReturnToAccount = () => {
    setShowBooking(false);
    setShowUserSettings(false);
  };

  // Ces fonctions seront implémentées ultérieurement
  /* 
  const handleShowAllergens = () => {
    // Implémentation à venir
  };

  const handleShowPersonalData = () => {
    // Implémentation à venir
  };

  const handleShowReservationHistory = () => {
    // Implémentation à venir
  };

  const handleShowAccessibility = () => {
    // Implémentation à venir
  };
  */

  // Fonctions temporaires pour éviter les erreurs TypeScript
  const noop = () => {}; // Fonction qui ne fait rien

  return (
    <div className="flex flex-col z-50 justify-center items-center pt-5 pb-0 bg-white w-full h-screen lg:h-auto lg-w-auto">
      <div className="fixed flex top-5 right-4 mr-2 gap-2 lg:hidden">
        <ArrowButton
          isContentVisible={isContentVisible}
          onClick={toggleContentVisibility}
        />
        <CloseButton onClick={handleClose} />
      </div>

      {!showBooking && !showUserSettings ? (
        <>
          <h1 className="text-center text-md font-bold pb-2">
            Bonjour {user?.firstname}
          </h1>
          <h2 className="text-center text-md mb-4">
            Comment puis-je vous aider ?
          </h2>
          <button
            className="bg-green-800 text-white text-sm font-bold px-4 py-2 rounded-lg mt-4"
            onClick={() => {
              setSelectedDate(new Date());
              setShowBooking(true);
            }}
          >
            Je souhaite réserver une table
          </button>

          {/* Affichage des réservations */}
          <div className="mt-6 w-full max-w-md px-4">
            <h3 className="text-lg font-semibold mb-3">Mes réservations</h3>
            {loading ? (
              <p className="text-center">Chargement des réservations...</p>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : !reservations || reservations.length === 0 ? (
              <p className="text-center text-gray-500">
                Aucune réservation trouvée
              </p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {reservations.map((reservation) => (
                  <div
                    key={reservation._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <p className="font-medium">
                      Date:{" "}
                      {new Date(reservation.date_selected).toLocaleDateString()}
                    </p>
                    <p>Heure: {reservation.time_selected}</p>
                    <p>Personnes: {reservation.nbr_persons}</p>
                    <p>Table: {reservation.table_number}</p>
                    <p className="mt-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          reservation.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : reservation.status === "waiting"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reservation.status === "confirmed"
                          ? "Confirmée"
                          : reservation.status === "waiting"
                          ? "En attente"
                          : "Annulée"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="bg-black text-white text-sm font-bold px-4 py-2 rounded-lg mt-4"
            onClick={handleManageAccountClick}
          >
            Je souhaite gérer mon compte
          </button>
          <p className="pt-7 pb-3">
            <button
              className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg mt-4"
              onClick={handleLogoutClick}
            >
              Se déconnecter
            </button>
          </p>
        </>
      ) : showBooking ? (
        <Booking
          selectedDate={selectedDate}
          onTimeSelected={handleTimeSelected}
          onReturnToAccount={handleReturnToAccount}
          restaurantId={restaurantId}
        />
      ) : (
        <UserSettings
          handleReturnToAccount={handleReturnToAccount}
          // Fonctions temporaires en attendant l'implémentation complète
          onShowAllergens={noop}
          onShowPersonalData={noop}
          onShowReservationHistory={noop}
          onShowAccessibility={noop}
        />
      )}
    </div>
  );
};
