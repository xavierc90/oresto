import { useEffect, useState, useCallback } from "react";
import { authService } from "./authService";
import { Company } from "../Types";
import { User } from "./user.type";
import {
  saveUserToStorage,
  saveCompanyToStorage,
  getUserFromStorage,
  getCompanyFromStorage,
  clearAuthStorage,
} from "../Utils/storageUtils";

// Utilitaire de log - n'affiche les logs qu'en développement
const logDebug = (message: string, data?: unknown) => {
  // Vérifier si nous sommes en environnement de développement
  // En production, cette condition sera fausse
  if (import.meta.env.DEV) {
    if (data) {
      console.log(`[Auth Debug] ${message}`, data);
    } else {
      console.log(`[Auth Debug] ${message}`);
    }
  }
};

export const useAuth = () => {
  // Utiliser nos fonctions utilitaires pour l'initialisation
  const [user, setUser] = useState<User | null>(() => {
    // Essayer d'abord avec authService, puis avec le localStorage
    return authService.currentUser || getUserFromStorage();
  });

  const [company, setCompany] = useState<Company | null>(() => {
    // Essayer d'abord avec authService, puis avec le localStorage
    return authService.currentCompany || getCompanyFromStorage();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Authentifié si on a un utilisateur
    return !!(authService.isAuthenticated || user);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification
  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const isValid = await authService.verifyToken();

      // Si le token est valide, on récupère les nouvelles valeurs depuis authService
      if (isValid) {
        const currentUser = authService.currentUser;
        const currentCompany = authService.currentCompany;

        // Mettre à jour les états locaux si besoin
        if (currentUser) {
          setUser(currentUser);
        }

        if (currentCompany) {
          setCompany(currentCompany);
        }

        // Assurer que isAuthenticated est cohérent
        setIsAuthenticated(true);
      } else {
        setError("Session expirée. Veuillez vous reconnecter.");
      }

      return isValid;
    } catch (err) {
      console.error("useAuth - Erreur dans verifyAuth:", err);
      setError("Erreur de vérification de la session.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userSubscription = authService.user$.subscribe((newUser) => {
      setUser(newUser);
    });

    const companySubscription = authService.company$.subscribe((newCompany) => {
      setCompany(newCompany);
    });

    const authSubscription = authService.isAuthenticated$.subscribe(
      (isAuth) => {
        setIsAuthenticated(isAuth);
      },
    );

    // Vérifier le token au chargement seulement si un utilisateur existe déjà
    if (authService.currentUser) {
      verifyAuth();
    }

    return () => {
      userSubscription.unsubscribe();
      companySubscription.unsubscribe();
      authSubscription.unsubscribe();
    };
  }, [verifyAuth]);

  // Fonction de connexion directe pour les managers (utilisée par LoginPage)
  const loginManager = useCallback(
    (user: User, restaurant: Company[] | null) => {
      setIsLoading(true);
      setError(null);
      try {
        // Mettre à jour l'état local
        setUser(user);

        // S'assurer que nous stockons correctement les données du restaurant
        if (restaurant && restaurant.length > 0) {
          const companyData = restaurant[0];
          setCompany(companyData);

          // Utiliser notre utilitaire pour stocker les données du restaurant
          saveCompanyToStorage(companyData);
        } else if (user.company_id) {
          // Si nous n'avons pas d'objet restaurant mais l'utilisateur a un company_id
          logDebug(
            "Utilisateur avec company_id mais sans données restaurant",
            user.company_id,
          );

          // Créer un objet company minimal pour la navigation
          const minimalCompany: Company = {
            _id: user.company_id,
            name:
              user.restaurant && user.restaurant.length > 0
                ? user.restaurant[0].name
                : "Restaurant",
            address: "",
            postal_code: "",
            city: "",
            country: "",
            phone_number: "",
            email: "",
            user_id: user._id,
            created_at: new Date(),
          };

          logDebug("Création d'un objet company minimal", minimalCompany);
          setCompany(minimalCompany);
          saveCompanyToStorage(minimalCompany);
        } else {
          setCompany(null);
          localStorage.removeItem("company");
        }

        setIsAuthenticated(true);

        // Utiliser notre utilitaire pour stocker les données utilisateur
        saveUserToStorage(user);

        logDebug("Authentication completed successfully");
        return { user, company: restaurant ? restaurant[0] : null };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur lors de la connexion manager";
        console.error("loginManager error:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fonction de connexion pour les utilisateurs réguliers via le widget
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      return result;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      // Nettoyer le state local
      setUser(null);
      setCompany(null);
      setIsAuthenticated(false);

      // Utiliser notre utilitaire pour nettoyer le localStorage
      clearAuthStorage();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Mettre à jour les données dans le localStorage
    authService.updateUser(updatedUser); // Si authService a une méthode pour mettre à jour l'utilisateur
  };

  // Rafraîchir le token
  const refreshToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await authService.refreshToken();
      if (!success) {
        setError("Impossible de rafraîchir la session.");
      }
      return success;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du rafraîchissement de la session";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper pour obtenir la configuration des requêtes
  const getRequestConfig = useCallback(() => {
    return authService.getRequestConfig();
  }, []);

  return {
    user,
    company,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    verifyAuth,
    refreshToken,
    getRequestConfig,
    loginManager,
  };
};
