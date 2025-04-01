import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { http } from "../../../../Infrastructure/Http/axios.instance";
import { Table } from "../../../../Module/Types";
import { FaTrashAlt, FaEye, FaEyeSlash, FaLightbulb } from "react-icons/fa"; // Import des icônes

interface TableAreaProps {
  restaurant: { _id: string };
  tables: Table[];
  onTablesUpdate: () => void; // Fonction de rappel pour notifier le parent des mises à jour
}

export const TablePlanArea: React.FC<TableAreaProps> = ({
  tables,
  onTablesUpdate,
}) => {
  // Coordonnées et dimensions de la poubelle
  const deleteZone = { width: 100, height: 100 };
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [overTrash, setOverTrash] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false); // Pour gérer l'animation du message
  const trashRef = useRef<HTMLDivElement | null>(null);
  const [clickStartedPosition, setClickStartedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickTime, setClickTime] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem("isDarkMode", String(newIsDarkMode));
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("isDarkMode");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "true");
    }
  }, []);

  const toggleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  // Fonction pour archiver la table et envoyer les coordonnées au backend
  const handleDragStop = async (
    e: DraggableEvent | MouseEvent | TouchEvent,
    data: { x: number; y: number },
    table: Table,
  ): Promise<void> => {
    const position_x = data.x;
    const position_y = data.y;
    setDraggingTableId(null);
    setIsDragging(false);

    const trashElement = trashRef.current;
    if (trashElement) {
      const trashRect = trashElement.getBoundingClientRect();
      const tableX = e instanceof MouseEvent ? e.clientX : 0;
      const tableY = e instanceof MouseEvent ? e.clientY : 0;

      if (
        tableX >= trashRect.left &&
        tableX <= trashRect.right &&
        tableY >= trashRect.top &&
        tableY <= trashRect.bottom
      ) {
        try {
          await http.put(`/archive_table/${table._id}`, {});

          setDeleteMessage(
            `La table n°${table.number} pour ${table.capacity} personnes a été supprimée`,
          );
          setShowDeleteMessage(false);
          setTimeout(() => setShowDeleteMessage(true), 100); // Activer l'animation
          setTimeout(() => setShowDeleteMessage(false), 5000); // Masquer le message après 5 secondes
          onTablesUpdate();
          return;
        } catch (error) {
          console.error("Erreur lors de l'archivage de la table:", error);
        }
      }
    }

    try {
      await http.put(`/update_table/${table._id}`, { position_x, position_y });

      onTablesUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la table:", error);
    }
  };

  const handleTableClick = async (table: Table) => {
    const newRotation = (table.rotate || 0) + 30;

    try {
      await http.put(`/update_table/${table._id}`, {
        rotate: newRotation % 360,
      });

      onTablesUpdate();
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la rotation de la table:",
        error,
      );
    }
  };

  const handleStart = (_e: DraggableEvent, data: DraggableData) => {
    setIsDragging(true);
    setClickStartedPosition({ x: data.x, y: data.y });
    setClickTime(Date.now()); // Enregistrer le temps de départ
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDrag = (e: DraggableEvent, _: DraggableData) => {
    const trashElement = trashRef.current;
    if (trashElement) {
      const trashRect = trashElement.getBoundingClientRect();
      let tableX = 0;
      let tableY = 0;

      // Déterminer les coordonnées en fonction du type d'événement
      if ("clientX" in e && "clientY" in e) {
        tableX = e.clientX;
        tableY = e.clientY;
      }

      if (
        tableX >= trashRect.left &&
        tableX <= trashRect.right &&
        tableY >= trashRect.top &&
        tableY <= trashRect.bottom
      ) {
        setOverTrash(true);
      } else {
        setOverTrash(false);
      }
    }
  };

  const handleStop = (e: DraggableEvent, data: DraggableData, table: Table) => {
    const distanceMoved =
      Math.abs(data.x - (clickStartedPosition?.x ?? 0)) +
      Math.abs(data.y - (clickStartedPosition?.y ?? 0));
    const clickDuration = Date.now() - clickTime;
    setDraggingTableId(null);
    setIsDragging(false);
    setOverTrash(false);

    // Si la souris n'a presque pas bougé ET que le temps est très court => clic => rotation
    if (distanceMoved < 5 && clickDuration < 300) {
      handleTableClick(table);
    } else {
      // Sinon => on considère que c'est un drag => mise à jour position
      handleDragStop(e, data, table);
    }
  };

  const getTableColor = (tableId: string): string => {
    if (draggingTableId === tableId) {
      return isDarkMode ? "#6c6c6c" : "#848485";
    }
    return isDarkMode ? "#ffffff" : "#EAE5E5";
  };

  const renderTableSVG = (table: Table) => {
    const tableColor = getTableColor(table._id);
    const rotation = table.rotate || 0;
    const seatColor = isDarkMode ? "#ffffff" : "#c2c2c2";

    if (table.shape === "rectangle") {
      if (table.capacity === 4) {
        return (
          <svg
            width="123"
            height="74"
            viewBox="0 0 123 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="32.3326"
              cy="8.25806"
              rx="7.5806"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="32.3326"
              cy="66.2533"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="90.4502"
              cy="8.25806"
              rx="7.58057"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="90.4502"
              cy="66.2533"
              rx="7.58057"
              ry="7.37634"
              fill={seatColor}
            />
            <rect y="8" width="123" height="57" fill={tableColor} />
          </svg>
        );
      }
      if (table.capacity === 6) {
        return (
          <svg
            width="123"
            height="74"
            viewBox="0 0 123 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="22.3326"
              cy="8.25806"
              rx="7.5806"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="22.3326"
              cy="66.2533"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="63.4502"
              cy="8.25806"
              rx="7.58057"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="63.4502"
              cy="66.2533"
              rx="7.58057"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="101.45"
              cy="8.25806"
              rx="7.58057"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="101.45"
              cy="66.2533"
              rx="7.58057"
              ry="7.37634"
              fill={seatColor}
            />
            <rect y="8" width="123" height="57" fill={tableColor} />
          </svg>
        );
      }
      if (table.capacity === 8) {
        return (
          <svg
            width="153"
            height="74"
            viewBox="0 0 153 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="37.3326"
              cy="8.25806"
              rx="7.5806"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="37.3326"
              cy="66.2533"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="78.4502"
              cy="8.25806"
              rx="7.58057"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="78.4502"
              cy="66.2533"
              rx="7.58057"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="116.45"
              cy="8.25806"
              rx="7.58057"
              ry="7.37635"
              fill={seatColor}
            />
            <ellipse
              cx="116.45"
              cy="66.2533"
              rx="7.58057"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="8.33255"
              cy="36.2533"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="145.333"
              cy="36.2533"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <rect x="10" y="8" width="134" height="57" fill={tableColor} />
          </svg>
        );
      }
    } else if (table.shape === "round") {
      if (table.capacity === 2) {
        return (
          <svg
            width="70"
            height="85"
            viewBox="0 0 70 85"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="35.5806"
              cy="7.37634"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="35.5806"
              cy="77.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <rect y="7" width="70" height="70" rx="35" fill={tableColor} />
          </svg>
        );
      }
      if (table.capacity === 4) {
        return (
          <svg
            width="86"
            height="85"
            viewBox="0 0 86 85"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="43.5806"
              cy="7.37634"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="43.5806"
              cy="77.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="7.5806"
              cy="42.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="77.5811"
              cy="42.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <rect
              x="8"
              y="7"
              width="70"
              height="70"
              rx="35"
              fill={tableColor}
            />
          </svg>
        );
      }
    } else if (table.shape === "square") {
      if (table.capacity === 2) {
        return (
          <svg
            width="70"
            height="90"
            viewBox="0 0 70 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="35.5806"
              cy="7.37634"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="35.5806"
              cy="82.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <rect y="10" width="70" height="70" fill={tableColor} />
          </svg>
        );
      }
      if (table.capacity === 4) {
        return (
          <svg
            width="87"
            height="86"
            viewBox="0 0 87 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <ellipse
              cx="43.5806"
              cy="7.37634"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="43.5806"
              cy="78.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="7.5806"
              cy="44.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <ellipse
              cx="78.5811"
              cy="44.3763"
              rx="7.5806"
              ry="7.37634"
              fill={seatColor}
            />
            <rect x="8" y="8" width="70" height="70" fill={tableColor} />
          </svg>
        );
      }
    }
    return null; // Valeur par défaut si aucune condition n'est remplie
  };

  return (
    <div
      className={`table-reservation-plan w-full h-96 mx-auto border-t border-zinc-300 relative ${
        isDarkMode ? "bg-gray-800 dark:bg-gray-900" : "bg-transparent"
      }`}
      style={{
        position: "relative",
        overflow: "hidden",
        background: isDarkMode ? "#202937" : "transparent",
      }}
    >
      {/* Bouton pour basculer entre clair et sombre */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-800 focus:outline-none z-50"
        aria-label="Changer le thème"
      >
        <FaLightbulb size={20} color={isDarkMode ? "#959595" : "#f8b94b"} />
      </button>

      {/* Bouton pour afficher/masquer la grille */}
      <button
        onClick={toggleGrid}
        className="absolute top-16 right-4 bg-gray-700 text-white p-2 rounded-full shadow-md hover:bg-gray-600 focus:outline-none"
        aria-label={showGrid ? "Masquer la grille" : "Afficher la grille"}
      >
        {showGrid ? <FaEyeSlash /> : <FaEye />}
      </button>

      {/* Message de suppression */}
      {deleteMessage && (
        <div className={`success-message ${showDeleteMessage ? "show" : ""}`}>
          {deleteMessage}
        </div>
      )}

      {/* Icône Poubelle */}
      {isDragging && (
        <div
          ref={trashRef}
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: `${deleteZone.width}px`,
            height: `${deleteZone.height}px`,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            opacity: overTrash ? 1 : 0.5,
          }}
        >
          <FaTrashAlt size={25} color="#ff0000" />
          <span className="text-sm">Supprimer</span>
        </div>
      )}

      {/* Affichage des tables correspondant au restaurant + non archivé */}
      {tables
        .filter((table) => table.status !== "archived")
        .map((table) => (
          <Draggable
            key={table._id}
            bounds="parent"
            defaultPosition={{
              x: table.position_x || 0,
              y: table.position_y || 0,
            }}
            onStart={(e, data) => {
              setIsDragging(true);
              handleStart(e, data);
            }}
            onDrag={(e, data) => handleDrag(e, data)}
            onStop={(e, data) => handleStop(e, data, table)}
          >
            <div
              className="table-container"
              style={{ position: "absolute", cursor: "pointer" }}
            >
              {renderTableSVG(table)}
              <div className="number-circle">
                <span>{table.number}</span>
              </div>
            </div>
          </Draggable>
        ))}
    </div>
  );
};
