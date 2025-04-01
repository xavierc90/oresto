import React, { useEffect, useState } from "react";

interface NotificationMessageProps {
  message: string | null;
  type: "success" | "error" | "warning"; // Ajout du type 'warning'
  duration?: number; // Durée d'affichage en millisecondes
}

export const NotificationMessage: React.FC<NotificationMessageProps> = ({
  message,
  type,
  duration = 5000,
}) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, duration);

      // Nettoyage du timer lorsque le message change ou au démontage
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  // Si aucun message n'est fourni, ne rien rendre
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-md z-[1000] transition-opacity duration-500 ease-in-out
        ${showMessage ? "opacity-100" : "opacity-0"} 
        ${
          type === "success"
            ? "bg-green-600 text-white font-semibold"
            : type === "error"
            ? "bg-red-600 text-white font-semibold"
            : "bg-orange-500 text-white font-semibold"
        }`}
    >
      {message}
    </div>
  );
};
