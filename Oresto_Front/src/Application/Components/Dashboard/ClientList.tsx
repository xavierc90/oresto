import { useState } from "react";
import { http } from "../../../Infrastructure/Http/axios.instance";
import { FaSort, FaUser, FaRegCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { User } from "../../../Module/Auth/user.type";
import { formatDateToFrench } from "../../../Module/Utils/dateFormatter";
import moment from "moment";
import { RxCross1 } from "react-icons/rx";
import { Reservation } from "../../../Module/Types";
import { StatusLabel } from "./StatusLabel";
import { NotificationMessage } from "../NotificationMessage";

interface ClientListProps {
  users: User[];
}

const availableAllergens = [
  "Arachides",
  "Noix",
  "Lait",
  "Œufs",
  "Poisson",
  "Crustacés",
  "Blé",
  "Soja",
  "Sésame",
  "Gluten",
  "Moutarde",
  "Céleri",
  "Sulfites",
  "Lupin",
  "Mollusques",
];

export const ClientList = ({ users }: ClientListProps) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Ajout du message d'erreur

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setEditableUser(user);
    setSelectedAllergens(user.allergens || []);
    setIsModalOpen(true);
    setSuccessMessage(null);
    try {
      const response = await http.get<Reservation[]>(
        `/reservations/user/${user._id}`,
      );
      const sortedReservations = response.data.sort(
        (a, b) =>
          new Date(b.date_selected).getTime() -
          new Date(a.date_selected).getTime(),
      );
      setReservations(sortedReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setReservations([]);
    setIsEditing(false);
    setSuccessMessage(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage(null);
  };

  const handleUpdateClick = async () => {
    if (!selectedUser || !editableUser) return;

    try {
      const response = await http.put(
        `/update_user/${selectedUser._id}`,
        {
          allergens: selectedAllergens,
          firstname: editableUser.firstname,
          lastname: editableUser.lastname,
          email: editableUser.email,
          phone_number: editableUser.phone_number,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      console.log("Update response:", response.data);

      setSuccessMessage("Informations du client mises à jour avec succès");
      setIsEditing(false);

      setSelectedUser({ ...editableUser, allergens: selectedAllergens });
    } catch (error) {
      console.error("Error updating user data:", error);
      setErrorMessage("Erreur lors de la mise à jour des informations");
    }
  };

  const handleAllergenChange = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens((prev) => prev.filter((a) => a !== allergen));
    } else {
      setSelectedAllergens((prev) => [...prev, allergen]);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (editableUser) {
      setEditableUser({ ...editableUser, [field]: value });
    }
  };

  const sortedUsers =
    sortOrder === "asc"
      ? [...users].sort((a, b) => a.lastname.localeCompare(b.lastname))
      : [...users].sort((a, b) => b.lastname.localeCompare(a.lastname));

  return (
    <div className="scrollable-list">
      <NotificationMessage message={successMessage} type="success" />
      <NotificationMessage message={errorMessage} type="error" />

      {sortedUsers.length === 0 ? (
        <div className="ml-10 mt-8 text-sm">Aucun client trouvé</div>
      ) : (
        <table className="ml-10 w-full">
          <thead className='dark:bg-gray-900"'>
            <tr>
              <th className="text-left dark:bg-gray-900">
                <span className="flex items-center">
                  Nom
                  <FaSort
                    onClick={handleSortToggle}
                    className="cursor-pointer"
                  />
                </span>
              </th>
              <th className="text-left dark:bg-gray-900">Prénom</th>
              <th className="text-left dark:bg-gray-900">Téléphone</th>
              <th className="text-left dark:bg-gray-900">E-mail</th>
              <th className="text-left hidden xl:table-cell dark:bg-gray-900">
                Inscrit depuis le
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user: User, index) => (
              <tr
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`hover:bg-gray-200 hover:cursor-pointer 
                  ${
                    index % 2 === 0
                      ? "bg-gray-100 dark:bg-gray-900"
                      : "bg-white dark:bg-gray-800"
                  } 
                  dark:hover:bg-gray-600 dark:text-white`}
              >
                <td className="py-1">{user.lastname}</td>
                <td>{user.firstname}</td>
                <td>{user.phone_number}</td>
                <td>{user.email}</td>
                <td className="hidden xl:block">
                  {formatDateToFrench(user.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              onClick={handleCloseModal}
            >
              <RxCross1 size={25} />
            </button>

            <h2 className="font-bold mb-2 flex items-center">
              <FaUser />
              <span className="pl-2">Informations du client</span>
            </h2>
            <h3 className="font-normal text-sm mb-2">
              Inscrit depuis le{" "}
              <span className="font-normal">
                {formatDateToFrench(selectedUser.created_at)}
              </span>
            </h3>

            <ul className="space-y-2 text-sm">
              <li className="font-semibold">
                Nom :
                {isEditing ? (
                  <input
                    type="text"
                    value={editableUser?.lastname || ""}
                    onChange={(e) =>
                      handleInputChange("lastname", e.target.value)
                    }
                    className="ml-2 border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 pl-2 rounded font-normal p-2"
                  />
                ) : (
                  <span className="font-normal"> {selectedUser.lastname}</span>
                )}
              </li>
              <li className="font-semibold">
                Prénom :
                {isEditing ? (
                  <input
                    type="text"
                    value={editableUser?.firstname || ""}
                    onChange={(e) =>
                      handleInputChange("firstname", e.target.value)
                    }
                    className="ml-2 border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 pl-2 rounded font-normal p-2"
                  />
                ) : (
                  <span className="font-normal"> {selectedUser.firstname}</span>
                )}
              </li>
              <li className="font-semibold">
                Email :
                {isEditing ? (
                  <input
                    type="text"
                    value={editableUser?.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="ml-2 border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 pl-2 rounded font-normal p-2 w-72"
                  />
                ) : (
                  <span className="font-normal"> {selectedUser.email}</span>
                )}
              </li>
              <li className="font-semibold">
                N° de téléphone :
                {isEditing ? (
                  <input
                    type="text"
                    value={editableUser?.phone_number || ""}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    className="ml-2 border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 pl-2 rounded font-normal p-2"
                  />
                ) : (
                  <span className="font-normal">
                    {" "}
                    {selectedUser.phone_number}
                  </span>
                )}
              </li>
              <li className="font-semibold">
                Allergènes :
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableAllergens.map((allergen) => (
                      <label
                        key={allergen}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAllergens.includes(allergen)}
                          onChange={() => handleAllergenChange(allergen)}
                        />
                        <span className="ml-2"> {allergen}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <span className="font-normal">
                    {" "}
                    {selectedUser.allergens && selectedUser.allergens.length > 0
                      ? selectedUser.allergens.join(", ")
                      : "Aucune allergie renseignée"}
                  </span>
                )}
              </li>
            </ul>
            <h2 className="font-bold mt-4 mb-2 flex items-center">
              <FaRegCalendarAlt />
              <span className="pl-2">Historique des réservations</span>
            </h2>
            <div className="reservation-list">
              {reservations.length > 0 ? (
                <ul className="list-none">
                  {reservations.map((reservation) => (
                    <ul
                      key={reservation._id}
                      className="mb-3 text-sm space-y-1"
                    >
                      <li className="font-semibold flex gap-2">
                        {moment(reservation.date_selected).format("DD/MM/YYYY")}{" "}
                        à {reservation.time_selected}
                        <StatusLabel status={reservation.status || "waiting"} />
                      </li>
                      <li>
                        Table {reservation.table?.number || "N/A"} pour{" "}
                        {reservation.nbr_persons || "0"} personnes
                      </li>
                      <li className="flex items-center">
                        {reservation.details && (
                          <FaInfoCircle className="mr-2" />
                        )}
                        {reservation.details ? reservation.details : ""}
                      </li>
                    </ul>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">
                  Aucune réservation trouvée pour cette personne.
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-5 items-center justify-center">
              {isEditing ? (
                <button
                  className="bg-black text-white text-sm font-semibold p-2 rounded-lg"
                  onClick={handleUpdateClick}
                >
                  Mettre à jour
                </button>
              ) : (
                <button
                  className="bg-black text-white text-sm font-semibold p-2 rounded-lg"
                  onClick={handleEditClick}
                >
                  Modifier
                </button>
              )}
              <button className="bg-red-600 text-white text-sm font-semibold p-2 rounded-lg">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
