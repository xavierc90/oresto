import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
    <div
      className="animate-spin rounded-full h-20 w-20 border-4 border-red-500"
      style={{ borderTopColor: 'transparent' }}
    ></div>
    <div className="mt-4 text-lg">Chargement des données</div>
  </div>
  );
};