import React, { useState, useEffect } from "react";
import moment from "moment"; // Assurez-vous d'importer moment
import { http } from "../../../Infrastructure/Http/axios.instance";
import { CalendarShadcn } from "../Dashboard/CalendarShadcn";
import { useAuth } from "../../../Module/Auth/useAuth";
import { AiOutlineCalendar } from "react-icons/ai";
import axios, { AxiosError } from "axios";

type BookingProps = {
  selectedDate: Date | null;
  onTimeSelected: () => void;
  onReturnToAccount: () => void;
  restaurantId: string;
};

interface ReservationDetails {
  date_selected: Date;
  time_selected: string;
  nbr_persons: number;
  details?: string;
  status: "waiting" | "confirmed" | "canceled" | "archived";
  restaurant_id: string;
  table_id: string;
  table_number: string;
  user_id: string;
  id?: string;
  table?: Array<{ table_number: string }>;
}

export const Booking: React.FC<BookingProps> = ({
  selectedDate,
  onReturnToAccount,
  restaurantId,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<
    "selectDate" | "selectTime" | "confirm" | "success"
  >("selectDate");
  const [timeSelected, setTimeSelected] = useState<string | null>(null);
  const [localDate, setLocalDate] = useState<Date>(selectedDate ?? new Date());
  const [nbrPersons, setNbrPersons] = useState(1);
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reservationDetails, setReservationDetails] =
    useState<ReservationDetails | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setLocalDate(new Date());
    }
  }, [selectedDate]);

  const validateDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateSelect = (date: Date) => {
    setLocalDate(date);
    if (validateDate(date)) {
      setErrorMessage(null);
    } else {
      setErrorMessage("Date non valide");
    }
  };

  const handleDateConfirm = () => {
    if (validateDate(localDate)) {
      setErrorMessage(null);
      setStep("selectTime");
    } else {
      setErrorMessage("Sélectionnez une date valide.");
    }
  };

  const handleTimeSelect = (time: string) => {
    setTimeSelected(time);
  };

  const handleConfirm = () => {
    if (timeSelected && localDate) {
      setStep("confirm");
    }
  };

  const handleFinalConfirmation = async () => {
    try {
      // Convertissez la date locale en date UTC pour l'envoyer au serveur
      const formattedDate = moment(localDate).format("YYYY-MM-DD");
      const bookingData = {
        date_selected: formattedDate,
        time_selected: timeSelected,
        nbr_persons: nbrPersons,
        user_id: user?._id,
        restaurant_id: restaurantId,
        details: additionalInfo,
      };

      // Log pour déboguer
      console.log("Restaurant ID envoyé:", restaurantId);
      console.log("Données de réservation:", bookingData);

      // S'assurer que la requête est envoyée avec les bons en-têtes
      const response = await http.post("/add_reservation", bookingData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 201) {
        setReservationDetails(response.data.data);
        setStep("success");
      } else {
        setErrorMessage("Erreur lors de la réservation, veuillez réessayer.");
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la requête :", error);

      // Récupérer le message d'erreur spécifique du backend si disponible
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{
          success: boolean;
          error: {
            message: string;
            type: string;
            details?: Record<string, unknown>;
          };
        }>;

        // Log détaillé pour le débogage
        console.log("Statut de l'erreur:", axiosError.response?.status);
        console.log("Données de l'erreur:", axiosError.response?.data);

        interface ServerErrorResponse {
          success: boolean;
          error: {
            message: string;
            type: string;
            details?: Record<string, unknown>;
          };
        }

        if (axiosError.response?.data) {
          const responseData = axiosError.response.data as ServerErrorResponse;
          if (responseData.error && responseData.error.message) {
            setErrorMessage(responseData.error.message);
          } else {
            setErrorMessage(
              "Erreur lors de la réservation, veuillez réessayer.",
            );
          }
        } else {
          setErrorMessage("Erreur lors de la réservation, veuillez réessayer.");
        }
      } else {
        // Message générique en cas d'erreur non-Axios
        setErrorMessage("Erreur lors de la réservation, veuillez réessayer.");
      }
    }
  };

  const incrementNbrPersons = () => setNbrPersons((prev) => prev + 1);
  const decrementNbrPersons = () =>
    setNbrPersons((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div>
      {step === "selectDate" && (
        <>
          <h2 className="text-lg font-bold pb-9">Choisissez la date</h2>
          <CalendarShadcn
            mode="single"
            selected={localDate}
            onSelect={handleDateSelect}
            required={true}
          />
          {errorMessage && (
            <p className="text-red-600 font-semibold">{errorMessage}</p>
          )}
          <button
            className={`bg-black text-white text-sm font-semibold py-2 px-4 rounded-lg mt-8 w-full ${
              !validateDate(localDate) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleDateConfirm}
            disabled={!validateDate(localDate)}
          >
            Sélectionner l'heure
          </button>
          <div className="mt-4 text-center">
            <button
              className="text-black underline"
              onClick={onReturnToAccount}
            >
              Retour à l'accueil
            </button>
          </div>
        </>
      )}

      {step === "selectTime" && (
        <>
          <h2 className="text-lg font-bold mb-4">Choisissez l'heure</h2>
          <div className="flex items-center justify-center text-green-800 mb-4">
            <AiOutlineCalendar
              className="mr-2 cursor-pointer"
              onClick={() => setStep("selectDate")}
            />
            <span>
              {localDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h3 className="font-bold text-md mb-2">Repas du midi</h3>
          <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 mb-4 font-semibold">
            {[
              "12:00",
              "12:15",
              "12:30",
              "12:45",
              "13:00",
              "13:15",
              "13:30",
              "13:45",
            ].map((time) => (
              <button
                key={time}
                className={`flex justify-center items-center py-2 px-4 text-center rounded-lg text-sm lg:text-base lg:py-3 lg:px-5 ${
                  timeSelected === time
                    ? "bg-green-800 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <h3 className="font-bold text-md mb-2 mt-6">Repas du soir</h3>
          <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 font-semibold">
            {[
              "20:00",
              "20:15",
              "20:30",
              "20:45",
              "21:00",
              "21:15",
              "21:30",
              "21:45",
            ].map((time) => (
              <button
                key={time}
                className={`flex justify-center items-center py-2 px-4 text-center rounded-lg text-sm lg:text-base lg:py-3 lg:px-5 ${
                  timeSelected === time
                    ? "bg-green-800 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            className={`bg-black text-white text-sm py-2 px-4 mt-9 lg:py-3 lg:px-5 font-bold rounded-lg ${
              !timeSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleConfirm}
            disabled={!timeSelected}
          >
            Finaliser la réservation
          </button>
          <div className="mt-4 text-center">
            <button
              className="text-black underline"
              onClick={onReturnToAccount}
            >
              Retour à l'accueil
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <h2 className="text-xl font-bold mb-4">Finaliser la réservation</h2>
          <div className="mb-4">
            <p className="font-semibold">Nom de réservation:</p>
            <p>
              {user?.firstname} {user?.lastname}
            </p>
          </div>
          <div className="mb-4">
            <p className="font-semibold">Date et heure sélectionnées:</p>
            <p>
              {localDate.toLocaleDateString()} à {timeSelected}
            </p>
          </div>
          <div className="mb-4">
            <p className="font-semibold">Nombre de couverts:</p>
            <div className="flex items-center justify-center my-4 gap-2">
              <button
                onClick={decrementNbrPersons}
                className="bg-black text-lg font-bold text-white py-1 px-4 rounded-lg"
              >
                -
              </button>
              <span className="text-lg font-bold px-2">{nbrPersons}</span>
              <button
                onClick={incrementNbrPersons}
                className="bg-green-800 text-lg font-bold text-white py-1 px-4 rounded-lg"
              >
                +
              </button>
            </div>
          </div>
          <div className="my-7">
            <p className="font-semibold">Infos complémentaires:</p>
            <textarea
              className="mt-4 w-full p-2 border border-gray-300 rounded-lg"
              rows={4}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Un anniversaire à fêter ? Une suggestion ? Faites-le nous savoir ici..."
            />
          </div>
          <div className="flex gap-4 justify-center">
            <button
              className="bg-black text-white text-sm font-semibold py-2 px-4 rounded-lg"
              onClick={() => setStep("selectDate")}
            >
              Modifier
            </button>
            <button
              className="bg-green-800 text-white text-sm font-semibold py-2 px-4 rounded-lg"
              onClick={handleFinalConfirmation}
            >
              Confirmer
            </button>
          </div>
          {errorMessage && (
            <p className="text-red-600 font-semibold mt-4">{errorMessage}</p>
          )}
          <div className="mt-4 text-center">
            <button
              className="text-black underline"
              onClick={onReturnToAccount}
            >
              Retour à l'accueil
            </button>
          </div>
        </>
      )}

      {step === "success" && reservationDetails && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Réservation effectuée</h2>
          <p className="mb-4">
            Vous recevrez un mail de confirmation dès que le restaurant aura
            confirmé la réservation.
          </p>
          <div className="bg-green-100 p-4 rounded-lg mb-4">
            <ul className="text-left">
              <li className="font-semibold mb-2">
                Nom de réservation :{" "}
                <span className="font-normal">{user?.lastname}</span>
              </li>
              <li className="font-semibold mb-2">
                Date :{" "}
                <span className="font-normal">
                  {localDate.toLocaleDateString()}
                </span>
              </li>
              <li className="font-semibold mb-2">
                Heure : <span className="font-normal">{timeSelected}</span>
              </li>
              <li className="font-semibold mb-2">
                Nombre de personnes :{" "}
                <span className="font-normal">{nbrPersons}</span>
              </li>
              <li className="font-semibold mb-2">
                Table n° :{" "}
                <span className="font-normal">
                  {(reservationDetails.table &&
                    reservationDetails.table[0]?.table_number) ||
                    reservationDetails.table_number ||
                    "Non attribuée"}
                </span>
              </li>
              {additionalInfo && (
                <li className="font-semibold mb-2">
                  Autres informations :{" "}
                  <span className="font-normal">{additionalInfo}</span>
                </li>
              )}
            </ul>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <p>Contact :</p>
            <p>{user?.email}</p>
            <p>{user?.phone_number}</p>
          </div>
          <button
            className="bg-black text-white text-sm font-semibold py-2 px-4 rounded-lg w-full"
            onClick={onReturnToAccount}
          >
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
};
