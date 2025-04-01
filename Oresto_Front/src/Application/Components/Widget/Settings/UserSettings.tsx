import { useState } from "react";
import { Allergens } from "./Allergens";

type UserSettingsProps = {
  handleReturnToAccount: () => void;
  onShowAllergens: () => void;
  onShowPersonalData: () => void;
  onShowReservationHistory: () => void;
  onShowAccessibility: () => void;
};

export const UserSettings: React.FC<UserSettingsProps> = ({
  handleReturnToAccount,
  onShowAllergens,
  onShowPersonalData,
  onShowReservationHistory,
  onShowAccessibility,
}) => {
  const [showAllergens, setShowAllergens] = useState(false);

  const handleShowAllergens = () => {
    setShowAllergens(true);
    onShowAllergens();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <h2 className="text-3xl lg:text-lg font-bold mb-4">Gérer mon compte</h2>
      <p className="text-gray-600 text-center mb-8 font-semibold text-xl lg:text-sm">
        Gérez vos données facilement depuis votre espace membre
      </p>

      <ul className="flex flex-col text-left text-md font-semibold gap-8 lg:gap-4 text-xl lg:text-sm my-6 lg:my-0">
        <li>
          <a
            href="#"
            className="hover:text-green-800"
            onClick={handleShowAllergens}
          >
            Mes préférences (allergènes)
          </a>
        </li>
        <li>
          <a
            href="#"
            className="hover:text-green-800"
            onClick={onShowPersonalData}
          >
            Mes données personnelles
          </a>
        </li>
        <li>
          <a
            href="#"
            className="hover:text-green-800"
            onClick={onShowReservationHistory}
          >
            Historique des réservations
          </a>
        </li>
        <li>
          <a
            href="#"
            className="hover:text-green-800"
            onClick={onShowAccessibility}
          >
            Accessibilité
          </a>
        </li>
      </ul>

      {showAllergens && <Allergens onReturnToAccount={handleReturnToAccount} />}

      <div className="mt-8 w-full text-center">
        <button
          className="bg-black text-white px-4 py-4 lg:py-2 lg:px-4 rounded-lg text-xl lg:text-sm font-semibold"
          onClick={handleReturnToAccount}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};
