import React from 'react';

type ReservationHistoryProps = {
  onReturnToAccount: () => void;
};

export const ReservationHistory: React.FC<ReservationHistoryProps> = ({ onReturnToAccount }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <h2 className="text-lg font-bold mb-4">Vos réservations</h2>
      
      <p className="text-gray-600 text-center text-sm mb-8">
      Consultez l'historique de vos réservations     
       </p>

      {/* Contenu pour gérer les préférences d'allergènes */}
      s
      <div className="mt-8 w-full text-center">
        <button
          className="bg-black text-white py-2 px-4 rounded-lg text-sm font-semibold"
          onClick={onReturnToAccount}
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
};
