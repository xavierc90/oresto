import axios from "axios";

// Utilitaire de log - n'affiche les logs qu'en développement
const logDebug = (message: string, data?: unknown) => {
  // Vérifier si nous sommes en environnement de développement
  if (import.meta.env.DEV) {
    if (data) {
      console.log(`[HTTP Debug] ${message}`, data);
    } else {
      console.log(`[HTTP Debug] ${message}`);
    }
  }
};

const API_URL = import.meta.env.VITE_API_URL;

logDebug("URL de l'API configurée:", API_URL);

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


// Intercepteur pour gérer les erreurs d'authentification
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    logDebug("Intercepteur HTTP - Erreur détectée", error);
    // Si l'erreur est de type 401 Unauthorized
    if (error.response && error.response.status === 401) {
      logDebug("Intercepteur HTTP - Erreur 401 détectée");
      // On pourrait rediriger vers la page de login ici
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Fonction utilitaire pour construire l'URL de l'API
export function apiPath(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
