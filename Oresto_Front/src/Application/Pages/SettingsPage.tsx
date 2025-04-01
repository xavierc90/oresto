import { useEffect, useState } from "react";
import { http } from "../../Infrastructure/Http/axios.instance";
import { FaStore, FaUser, FaRegClock } from "react-icons/fa";
import { useDashboard } from "../../Module/Context/Dashboard/DashboardContext";

interface Hour {
  period: "afternoon" | "evening";
  opening: string;
  closing: string;
  _id: string;
  status: string;
}

interface OpeningHour {
  _id: string;
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  hours: Hour[];
}

const daysOfWeek: { [key in OpeningHour["day"]]: string } = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

const englishDaysOrder: OpeningHour["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const SettingsPage = () => {
  const { restaurant, user } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedHours, setEditedHours] = useState<OpeningHour[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    document.title = "Oresto - Paramètres";
    const fetchOpeningHours = async () => {
      if (restaurant?._id) {
        try {
          const response = await http.get(`/opening_hours/${restaurant._id}`);
          const fetchedHours: OpeningHour[] = response.data.map(
            (day: OpeningHour) => ({
              ...day,
              hours: day.hours.map((hour) => ({
                ...hour,
                status:
                  hour.status === "opened" || hour.status === "closed"
                    ? hour.status
                    : "opened",
              })),
            }),
          );

          const sortedOpeningHours = fetchedHours.sort(
            (a, b) =>
              englishDaysOrder.indexOf(a.day) - englishDaysOrder.indexOf(b.day),
          );

          setEditedHours(sortedOpeningHours);
        } catch (error: Error | unknown) {
          console.error("Erreur lors de la récupération des horaires :", error);
          setErrorMessage("Erreur lors de la récupération des horaires");
          setSuccessMessage(null);
          setShowErrorMessage(true);
          setTimeout(() => setShowErrorMessage(false), 3500);
        }
      }
    };

    if (restaurant?._id) {
      fetchOpeningHours();
    }
  }, [restaurant?._id]);

  const handleInputChange = (
    dayId: string,
    hourId: string,
    field: string,
    value: string,
  ) => {
    const updatedHours = editedHours.map((day) => {
      if (day.day === dayId) {
        return {
          ...day,
          hours: day.hours.map((hour) => {
            if (hour._id === hourId) {
              return { ...hour, [field]: value };
            }
            return hour;
          }),
        };
      }
      return day;
    });
    setEditedHours(updatedHours);
  };

  const handleStatusChange = (dayId: string, hourId: string) => {
    const updatedHours = editedHours.map((day) => {
      if (day.day === dayId) {
        return {
          ...day,
          hours: day.hours.map((hour) => {
            if (hour._id === hourId) {
              return {
                ...hour,
                status: hour.status === "opened" ? "closed" : "opened",
              };
            }
            return hour;
          }),
        };
      }
      return day;
    });
    setEditedHours(updatedHours);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleUpdateClick = async () => {
    if (!restaurant?._id) {
      console.error("ID de l'entreprise manquant");
      setErrorMessage(
        "Erreur lors de la mise à jour des horaires : ID de l'entreprise manquant",
      );
      setSuccessMessage(null);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3500);
      return;
    }

    try {
      const updatedData = editedHours.map((day) => ({
        day: day.day,
        hours: day.hours.map((hour) => ({
          period: hour.period, // On ajoute la période ici
          opening: hour.opening,
          closing: hour.closing,
          status: hour.status,
        })),
      }));

      await http.put(`/update_hours/${restaurant._id}`, updatedData);

      setIsEditing(false);
      setSuccessMessage("Vos horaires ont été modifiés avec succès");
      setErrorMessage(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error: Error | unknown) {
      setErrorMessage("Erreur lors de la mise à jour des horaires");
      setSuccessMessage(null);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3500);
    }
  };

  return (
    <div className="bg-light text-black dark:text-white pt-10 pl-10">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <h2 className="text-xl mt-1 mb-8">Gérer les paramètres principaux</h2>

      <div className="flex justify-between gap-10">
        <div className="w-1/2">
          <div className="border-2 border-gray-200 dark:bg-dark-900 dark:border-0 p-5 ml-0 rounded-lg text-lg">
            <div className="flex items-center pb-2">
              <FaStore size={24} />
              <h3 className="ml-2 text-lg font-semibold">
                Informations du restaurant
              </h3>
            </div>
            {restaurant ? (
              <ul>
                <li className="pb-2">
                  <span className="font-semibold">Nom du restaurant :</span>{" "}
                  {restaurant.name}
                </li>
                <li className="pb-2">
                  <span className="font-semibold">Adresse :</span>{" "}
                  {restaurant.address}
                </li>
                <li className="pb-2">
                  <span className="font-semibold">Code postal : </span>
                  {restaurant.postal_code}
                </li>
                <li className="pb-2">
                  <span className="font-semibold">Ville : </span>{" "}
                  {restaurant.city}
                </li>
                <li className="pb-2">
                  <span className="font-semibold">Pays : </span>
                  {restaurant.country}
                </li>
              </ul>
            ) : (
              <p>Chargement des informations de la compagnie...</p>
            )}
          </div>

          <div className="border-2 border-gray-200 dark:bg-dark-900 dark:border-0 p-5 mt-4 ml-0 rounded-lg text-lg">
            <div className="flex items-center pb-2">
              <FaUser size={24} />
              <h3 className="ml-2 text-lg font-semibold">
                Votre compte Oresto
              </h3>
            </div>
            {user ? (
              <ul>
                <li className="pb-2">
                  <strong>Nom : </strong>
                  {user?.lastname}
                </li>
                <li className="pb-2">
                  <strong>Prénom : </strong>
                  {user?.firstname}
                </li>
                <li className="pb-2">
                  <strong>Profil : </strong>
                  {user?.role}
                </li>
                <li className="pb-2">
                  <strong>N° de téléphone :</strong> {user?.phone_number}
                </li>
                <li className="pb-2">
                  <strong>Adresse mail :</strong> {user?.email}
                </li>
              </ul>
            ) : (
              <p>Chargement des informations de la compagnie...</p>
            )}
          </div>
        </div>

        {/* Deuxième colonne */}
        <div className="w-2/3">
          <div className="dark:bg-dark-900 dark:border-0 p-5 rounded-lg text-lg">
            <div className="flex items-center pb-4">
              <FaRegClock size={24} />
              <h3 className="text-lg font-semibold ml-2">
                Horaires d'ouverture
                {isEditing ? (
                  <button
                    onClick={handleUpdateClick}
                    className="ml-4 bg-black text-white text-xs p-2 rounded"
                  >
                    Mettre à jour
                  </button>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="ml-4 bg-black text-white text-xs p-2 rounded"
                  >
                    Modifier
                  </button>
                )}
              </h3>
            </div>

            {successMessage && (
              <div
                className={`success-message ${
                  showSuccessMessage ? "show" : ""
                }`}
              >
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div
                className={`error-message ${showErrorMessage ? "show" : ""}`}
              >
                {errorMessage}
              </div>
            )}

            <table className="w-full text-lg">
              <thead>
                <tr>
                  <th className="text-left dark:bg-gray-900">Jour</th>
                  <th className="text-center dark:bg-gray-900">Midi</th>
                  <th className="text-center dark:bg-gray-900">Soir</th>
                </tr>
              </thead>
              <tbody>
                {editedHours.map((day, index) => (
                  <tr
                    key={day.day}
                    className={`py-4 ${
                      index % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : ""
                    }`}
                  >
                    <td className="font-semibold text-lg pr-12">
                      {daysOfWeek[day.day]}
                    </td>
                    <td className="text-center">
                      {isEditing ? (
                        <div className="flex space-x-2 justify-center max-w-full overflow-hidden">
                          <input
                            type="checkbox"
                            checked={day.hours[0].status === "opened"}
                            onChange={() =>
                              handleStatusChange(day.day, day.hours[0]._id)
                            }
                          />
                          <input
                            type="time"
                            value={day.hours[0]?.opening || "00:00"}
                            onChange={(e) =>
                              handleInputChange(
                                day.day,
                                day.hours[0]._id,
                                "opening",
                                e.target.value,
                              )
                            }
                            className="border pl-2 rounded dark:text-white text-lg border-dark-900 text-center w-1/2 dark:bg-gray-900"
                            disabled={day.hours[0].status === "closed"}
                          />
                          <input
                            type="time"
                            value={day.hours[0]?.closing || "00:00"}
                            onChange={(e) =>
                              handleInputChange(
                                day.day,
                                day.hours[0]._id,
                                "closing",
                                e.target.value,
                              )
                            }
                            className="border pl-2 rounded dark:text-white text-lg border-dark-900 dark:bg-gray-900 w-1/2"
                            disabled={day.hours[0].status === "closed"}
                          />
                        </div>
                      ) : day.hours[0].status === "closed" ? (
                        "Fermé"
                      ) : (
                        `${day.hours[0]?.opening} - ${day.hours[0]?.closing}`
                      )}
                    </td>
                    <td className="text-center dark:bg-gray-900">
                      {isEditing ? (
                        <div className="flex space-x-2 justify-center max-w-full overflow-hidden">
                          <input
                            type="checkbox"
                            checked={day.hours[1].status === "opened"}
                            onChange={() =>
                              handleStatusChange(day.day, day.hours[1]._id)
                            }
                          />
                          <input
                            type="time"
                            value={day.hours[1]?.opening || "00:00"}
                            onChange={(e) =>
                              handleInputChange(
                                day.day,
                                day.hours[1]._id,
                                "opening",
                                e.target.value,
                              )
                            }
                            className="border pl-2 rounded dark:bg-dark-900 dark:text-white text-lg border-dark-900 w-1/2"
                            disabled={day.hours[1].status === "closed"}
                          />
                          <input
                            type="time"
                            value={day.hours[1]?.closing || "00:00"}
                            onChange={(e) =>
                              handleInputChange(
                                day.day,
                                day.hours[1]._id,
                                "closing",
                                e.target.value,
                              )
                            }
                            className="border pl-2 rounded dark:bg-dark-900 dark:text-white text-lg border-dark-900 w-1/2"
                            disabled={day.hours[1].status === "closed"}
                          />
                        </div>
                      ) : day.hours[1].status === "closed" ? (
                        "Fermé"
                      ) : (
                        `${day.hours[1]?.opening} - ${day.hours[1]?.closing}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
