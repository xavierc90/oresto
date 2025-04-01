import { BehaviorSubject } from "rxjs";
import { User } from "./user.type";
import { Company } from "../Types";
import axios from "axios";

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL;

// Fonction utilitaire pour normaliser les chemins d'API et éviter les doubles slashes
const apiPath = (path: string): string => {
  // S'assurer que l'URL de base ne se termine pas par un slash et que le chemin commence par un slash
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

// Configurer axios pour envoyer les cookies
axios.defaults.withCredentials = true;

// Type pour le résultat de login
export interface LoginResult {
  user: User;
  company: Company | null;
}

class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private companySubject = new BehaviorSubject<Company | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public user$ = this.userSubject.asObservable();
  public company$ = this.companySubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Ajout de getters pour accéder aux valeurs actuelles
  public get currentUser(): User | null {
    return this.userSubject.getValue();
  }

  public get currentCompany(): Company | null {
    return this.companySubject.getValue();
  }

  public get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.getValue();
  }

  constructor() {
    // Initialiser l'état à partir du localStorage
    const user = this.loadFromLocalStorage("user");
    const company = this.loadFromLocalStorage("company");

    if (user) {
      this.userSubject.next(user);
      this.companySubject.next(company);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuth();
    }
  }

  // Méthode pour effacer complètement l'authentification
  public clearAuth(): void {
    this.userSubject.next(null);
    this.companySubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    // Optionnel: effacer aussi le cookie
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  private loadFromLocalStorage(key: string) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        // Vérifier que ce n'est pas du HTML
        if (data.includes("<!doctype html>") || data.includes("<html>")) {
          console.error(
            `Données HTML invalides trouvées dans ${key}, suppression`,
          );
          localStorage.removeItem(key);
          return null;
        }

        const parsedData = JSON.parse(data);

        // Vérifier que c'est un objet valide
        if (!parsedData || typeof parsedData !== "object") {
          console.error(`Données invalides dans ${key}, suppression`);
          localStorage.removeItem(key);
          return null;
        }

        return parsedData;
      } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        localStorage.removeItem(key);
        return null;
      }
    }
    return null;
  }

  // Méthode pour authentifier un utilisateur
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await axios.post(
        apiPath("/login"),
        { email, password },
        { withCredentials: true }, // Essentiel pour recevoir et stocker le cookie
      );

      if (response.status === 200) {
        const userData = response.data;

        // Extraire les données de l'entreprise (restaurant)
        const company = userData.restaurant || null;

        // Stocker dans le state et localStorage (mais pas le token qui est maintenant en cookie)
        this.userSubject.next(userData);
        this.companySubject.next(company);
        this.isAuthenticatedSubject.next(true);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("company", JSON.stringify(company));

        return { user: userData, company };
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Méthode pour déconnecter un utilisateur
  async logout(): Promise<void> {
    try {
      // Appeler l'API de déconnexion (qui effacera le cookie)
      await axios.post(apiPath("/logout"), {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // Nettoyage local
      this.userSubject.next(null);
      this.companySubject.next(null);
      this.isAuthenticatedSubject.next(false);
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("company");
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      const response = await axios.put(
        apiPath(`/update_user/${user._id}`),
        user,
        { withCredentials: true },
      );

      const updatedUser = response.data;
      const company = updatedUser.restaurant || null;

      // Mise à jour du state interne
      this.userSubject.next(updatedUser);
      this.companySubject.next(company);

      // Mise à jour du localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("company", JSON.stringify(company));

      return updatedUser;
    } catch (error) {
      console.error("Update user error", error);
      throw error;
    }
  }

  // Vérifier si le token est valide
  async verifyToken(): Promise<boolean> {
    try {
      const response = await axios.get(apiPath("/verify-token"), {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Mise à jour des données utilisateur avec celles reçues du serveur
        const userData = response.data;
        const company = userData.restaurant || null;

        this.userSubject.next(userData);
        this.companySubject.next(company);
        this.isAuthenticatedSubject.next(true);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("company", JSON.stringify(company));

        return true;
      }
      return false;
    } catch (error) {
      this.userSubject.next(null);
      this.companySubject.next(null);
      this.isAuthenticatedSubject.next(false);
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      return false;
    }
  }

  // Rafraîchir le token
  async refreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(
        apiPath("/refresh-token"),
        {},
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        const userData = response.data;
        const company = userData.restaurant || null;

        this.userSubject.next(userData);
        this.companySubject.next(company);
        this.isAuthenticatedSubject.next(true);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("company", JSON.stringify(company));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error", error);
      return false;
    }
  }

  // Configuration axios pour les requêtes API
  getRequestConfig() {
    return { withCredentials: true };
  }
}

export const authService = new AuthService();
