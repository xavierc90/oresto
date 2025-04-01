export const formatDateWithoutTime = (dateString: string): string => {
  // Création de l'objet Date à partir de la chaîne d'entrée
  const date = new Date(dateString);

  // Vérification de la validité de l'objet Date
  if (isNaN(date.getTime())) {
    console.error('Invalid date provided:', dateString);
    return 'Date invalide';  // ou retourner la chaîne originale ou une autre notification d'erreur
  }

  // Options pour le formatage de la date
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  // Formatage de la date en français
  const formattedDate = date.toLocaleDateString('fr-FR', options);

  // Retourne la date formatée avec la première lettre en majuscule
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};
