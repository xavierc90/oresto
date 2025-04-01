import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DashboardNav } from "../Components/Dashboard/DashboardNav";
import { http } from "../../Infrastructure/Http/axios.instance";
import { useAuth } from "../../Module/Auth/useAuth";
import { CookieBanner } from "../Components/CookieBanner";
import { useDashboard } from "../../Module/Context/Dashboard/DashboardContext";

export const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const { user, restaurant } = useDashboard();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get(`/verify-token`);
        console.log("Vérification du token réussie:", response.data);
        return true;
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error,
        );
        return false;
      }
    };

    // DashboardPage ne redirige plus vers /login, cette responsabilité est désormais
    // exclusivement gérée par ProtectedRoute pour éviter les conflits
    // Nous vérifions juste le token pour maintenir l'état à jour
    fetchData();
  }, [user, isAuthenticated, navigate]);

  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white">
      <DashboardNav restaurant={restaurant} setIsNavOpen={setIsNavOpen} />

      <div
        className={`transition-all duration-300 h-full w-full ${
          isNavOpen ? "ml-72" : "ml-16"
        }`}
      >
        <div className="w-full h-full relative">
          <Outlet />
        </div>
      </div>
      <CookieBanner />
    </div>
  );
};
