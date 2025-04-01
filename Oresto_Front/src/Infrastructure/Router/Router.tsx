import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "../../Application/Pages/LandingPage";
import { HomePage } from "../../Application/Pages/HomePage";
import { LoginPage } from "../../Application/Pages/LoginPage";
import { DashboardPage } from "../../Application/Pages/DashboardPage";
import { ReservationsPage } from "../../Application/Pages/ReservationsPage";
import { ClientsPage } from "../../Application/Pages/ClientsPage";
import { TablePlanPage } from "../../Application/Pages/TablePlanPage";
import { AnalyticsPage } from "../../Application/Pages/AnalyticsPage";
import { SettingsPage } from "../../Application/Pages/SettingsPage";
import { RegisterRestaurant } from "../../Application/Pages/RegisterRestaurant";
import { RegisterPage } from "../../Application/Pages/RegisterPage";
import { SearchPage } from "../../Application/Pages/SearchPage";
import { ProtectedRoute } from "./ProtectedRoute";
import NotFoundPage from "../../Application/Pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/demo",
    element: <HomePage />,
  },
  {
    path: "/test",
    element: <SearchPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <DashboardPage />,
        children: [
          {
            path: "reservations",
            element: <ReservationsPage />,
          },
          {
            path: "table_plan",
            element: <TablePlanPage />,
          },
          {
            path: "clients",
            element: <ClientsPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/register_restaurant",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <RegisterRestaurant />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
