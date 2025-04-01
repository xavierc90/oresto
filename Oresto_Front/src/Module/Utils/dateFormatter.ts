// dateFormatter.ts
export const formatDateToFrench = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const formattedDate = date.toLocaleDateString('fr-FR', options);
  
    const capitalizeFirstLetter = (str: string): string => {
      return str.charAt(0).toLocaleUpperCase('fr-FR') + str.slice(1).toLowerCase();
    };
  
    return capitalizeFirstLetter(formattedDate).replace('À', 'à');
  };
  