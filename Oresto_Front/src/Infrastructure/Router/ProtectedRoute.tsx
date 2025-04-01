import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Module/Auth/useAuth";
import { useEffect, useState, useRef } from "react";
import { DashboardProvider } from "../../Module/Context/Dashboard";

// Utilitaire de log - n'affiche les logs qu'en développement
const logDebug = (message: string, data?: unknown) => {
  // Vérifier si nous sommes en environnement de développement
  if (import.meta.env.DEV) {
    if (data) {
      console.log(`[Route Debug] ${message}`, data);
    } else {
      console.log(`[Route Debug] ${message}`);
    }
  }
};

export const ProtectedRoute = () => {
  const { user, isAuthenticated, verifyAuth } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Utiliser useRef pour éviter les dépendances qui pourraient causer des boucles
  const userRef = useRef(user);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    userRef.current = user;
    isAuthenticatedRef.current = isAuthenticated;
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Si les données sont déjà disponibles, autoriser l'accès immédiatement
    if (userRef.current && isAuthenticatedRef.current) {
      setIsAuthorized(true);
      setIsVerifying(false);
      return;
    }

    // Variable pour éviter les vérifications multiples
    let isMounted = true;

    // Sinon, vérifier l'authentification
    const checkAuth = async () => {
      try {
        const isValid = await verifyAuth();

        // Ne mettre à jour que si le composant est toujours monté
        if (isMounted) {
          // ⚠️ Important: vérifier à nouveau user et isAuthenticated après la vérification
          // car verifyAuth a pu les mettre à jour via authService
          setIsAuthorized(isValid);

          if (!isValid) {
            logDebug("Token invalide, redirection nécessaire");
          } else {
            logDebug("Token valide, accès autorisé");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            "ProtectedRoute - Erreur lors de la vérification:",
            error,
          );
          setIsAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // N'exécuter qu'une seule fois
    checkAuth();

    // Nettoyage pour éviter les mises à jour sur un composant démonté
    return () => {
      isMounted = false;
    };
  }, [verifyAuth]);

  // Pendant la vérification, afficher un état de chargement
  if (isVerifying) {
    return <div>Vérification de l'authentification...</div>;
  }

  // Après vérification, soit autoriser l'accès soit rediriger
  // Envelopper l'Outlet avec le DashboardProvider pour fournir le contexte
  return isAuthorized ? (
    <DashboardProvider>
      <Outlet />
    </DashboardProvider>
  ) : (
    <Navigate to="/login" />
  );
};
