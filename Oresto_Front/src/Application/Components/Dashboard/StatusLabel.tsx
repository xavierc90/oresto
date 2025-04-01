import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

interface StatusLabelProps {
  status: string;
}

export const StatusLabel: React.FC<StatusLabelProps> = ({ status }) => {
  let statusText = "";
  let color = "";
  let IconComponent = null; // Variable pour stocker l'icône

  switch (status) {
    case "confirmed":
      statusText = "Confirmée";
      color = "#4CAF50";
      IconComponent = FaCheckCircle;
      break;
    case "canceled":
      statusText = "Annulée";
      color = "#fe6161";
      IconComponent = FaTimesCircle;
      break;
    case "waiting":
      statusText = "En attente";
      color = "#FF9800";
      IconComponent = FaClock;
      break;
    default:
      statusText = "État inconnu";
      color = "#9E9E9E";
      IconComponent = FaClock;
  }

  return (
    <span className="flex items-center">
      {IconComponent && <IconComponent className="mr-2" style={{ color }} />}{" "}
      {statusText}
    </span>
  );
};

export default StatusLabel;
