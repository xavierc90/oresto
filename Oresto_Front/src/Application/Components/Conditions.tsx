import React, { ReactNode } from "react";

interface ConditionsProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Conditions: React.FC<ConditionsProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "5%",
        left: "5%",
        width: "90%",
        height: "90%",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          height: "100%",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <button onClick={onClose} style={{ float: "right" }}>
          Close
        </button>
        {children}
      </div>
    </div>
  );
};
