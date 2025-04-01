import React, { useState } from "react";
import squareSvg from "/svg/square.svg";
import square4Svg from "/svg/square4.svg";
import circleSvg from "/svg/rounded.svg";
import circle4Svg from "/svg/rounded4.svg";
import rectangleSvg from "/svg/rectangle.svg";
import rectangle6Svg from "/svg/rectangle6.svg";
import rectangle8Svg from "/svg/rectangle8.svg";
import { http } from "../../../../Infrastructure/Http/axios.instance";
import { useAuth } from "../../../../Module/Auth/useAuth";
import { Restaurant } from "../../../../Module/Types";

interface TableData {
  number: string;
  capacity: number;
  shape: string;
}

// Ajout de l'interface pour les props du composant
interface TableFormProps {
  onTableCreated?: () => void; // Fonction de rappel optionnelle
  restaurant?: Restaurant; // Restaurant optionnel (si fourni directement par props)
}

const tableShapes = [
  {
    shape: "square",
    capacity: 2,
    svg: squareSvg,
  },
  {
    shape: "round",
    capacity: 2,
    svg: circleSvg,
  },
  {
    shape: "square",
    capacity: 4,
    svg: square4Svg,
  },
  {
    shape: "round",
    capacity: 4,
    svg: circle4Svg,
  },
  {
    shape: "rectangle",
    capacity: 4,
    svg: rectangleSvg,
  },
  {
    shape: "rectangle",
    capacity: 6,
    svg: rectangle6Svg,
  },
  {
    shape: "rectangle",
    capacity: 8,
    svg: rectangle8Svg,
  },
];

export const TableForm: React.FC<TableFormProps> = ({
  onTableCreated,
  restaurant,
}) => {
  const { company } = useAuth();
  // Priorité au restaurant fourni par props, puis à celui de useAuth
  const restaurantToUse = restaurant || company;

  const [tableData, setTableData] = useState<TableData>({
    number: "",
    capacity: 0,
    shape: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShapeChange = (shape: string, capacity: number) => {
    setTableData((prev) => ({ ...prev, shape, capacity }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tableData.number || !tableData.shape || !tableData.capacity) {
      setErrorMessage("Veuillez sélectionner un modèle de table");
      setSuccessMessage(null);
      setShowErrorMessage(false);
      setShowSuccessMessage(false);
      setTimeout(() => setShowErrorMessage(true), 100);
      setTimeout(() => setShowErrorMessage(false), 3500);
      return;
    }

    if (!restaurantToUse) {
      setErrorMessage("Restaurant ID manquant");
      return;
    }

    try {
      // Utilisation des cookies HTTP au lieu du token
      await http.post("/add_table", {
        ...tableData,
        restaurant_id: restaurantToUse._id,
      });

      setSuccessMessage(
        `Table n°${tableData.number} pour ${tableData.capacity} personnes créée avec succès`,
      );
      setErrorMessage(null);
      setShowSuccessMessage(false);
      setShowErrorMessage(false);
      setTimeout(() => setShowSuccessMessage(true), 100);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      setTableData({ number: "", capacity: 0, shape: "" });

      // Appeler la fonction de rappel si elle est fournie
      if (onTableCreated) {
        onTableCreated();
      }
    } catch (error: Error | unknown) {
      setErrorMessage("Erreur lors de l'ajout de la table");
      console.error("Erreur lors de l'ajout de la table:", error);
    }
  };

  return (
    <div>
      {successMessage && (
        <div className={`success-message ${showSuccessMessage ? "show" : ""}`}>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className={`error-message ${showErrorMessage ? "show" : ""}`}>
          {errorMessage}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col mt-7 mb-12 h-[310px] pl-10"
      >
        <div className="flex gap-5">
          <label className="flex items-center text-lg">
            N° de la table :
            <input
              type="text"
              name="number"
              className="border-2 border-gray-300 ml-5 w-14 text-center dark:text-white dark:bg-dark-800 dark:border-2 dark:border-dark-900 w-100 py-1"
              value={tableData.number}
              onChange={handleChange}
              required
            />
          </label>
          <button
            type="submit"
            className="mt-4 mb-4 p-2 bg-black text-white text-md px-3 "
          >
            {" "}
            Ajouter la table
          </button>
        </div>
        <div className="mt-8 text-lg">
          Modèle de table :
          <div className="flex gap-4 ml-4 mt-8">
            {tableShapes.map(({ shape, capacity, svg }) => {
              const isSelected =
                tableData.shape === shape && tableData.capacity === capacity;
              return (
                <label
                  key={`${shape}-${capacity}`}
                  className="flex items-center space-x-2 my-4"
                >
                  <input
                    type="radio"
                    name="shape"
                    value={`${shape}-${capacity}`}
                    checked={isSelected}
                    onChange={() => handleShapeChange(shape, capacity)}
                    className="invisible-radio"
                  />
                  <img
                    src={svg}
                    alt={shape}
                    className={isSelected ? "filter-green" : ""}
                    style={{ height: 60 }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};
