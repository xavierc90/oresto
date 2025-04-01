/**
 * Utilitaires pour la gestion du localStorage
 */

import { User } from "../Auth/user.type";
import { Company } from "../Types";

/**
 * Stocke les données utilisateur dans le localStorage
 */
export const saveUserToStorage = (user: User): void => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
  }
};

/**
 * Stocke les données du restaurant dans le localStorage
 */
export const saveCompanyToStorage = (company: Company): void => {
  try {
    localStorage.setItem("company", JSON.stringify(company));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du restaurant:", error);
  }
};

/**
 * Récupère l'utilisateur depuis le localStorage
 */
export const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

/**
 * Récupère le restaurant depuis le localStorage
 */
export const getCompanyFromStorage = (): Company | null => {
  try {
    const companyStr = localStorage.getItem("company");
    if (!companyStr) return null;
    return JSON.parse(companyStr);
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
    return null;
  }
};

/**
 * Nettoie les données d'authentification du localStorage
 */
export const clearAuthStorage = (): void => {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("company");
  } catch (error) {
    console.error("Erreur lors du nettoyage du localStorage:", error);
  }
};
