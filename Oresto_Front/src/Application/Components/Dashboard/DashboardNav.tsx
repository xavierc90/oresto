import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BsListCheck } from "react-icons/bs";
import { FaUsers, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";
import { FaGear } from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  MdLogout,
  MdArrowLeft,
  MdArrowRight,
  MdOutlineDarkMode,
  MdLightMode,
} from "react-icons/md";
import { CalendarShadcn } from "./CalendarShadcn";
import { Restaurant } from "../../../Module/Types";
import { useAuth } from "../../../Module/Auth/useAuth";
import { dateService } from "../../../Module/Utils/dateService";
import { searchService } from "../../../Module/Utils/searchService";
import clsx from "clsx";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface DashboardNavProps {
  restaurant: Restaurant | null;
  setIsNavOpen: (isOpen: boolean) => void;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  restaurant,
  setIsNavOpen,
}) => {
  const [dateSelected, setDateSelected] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [shouldFocusSearch, setShouldFocusSearch] = useState<boolean>(false);

  useEffect(() => {
    if (shouldFocusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      setShouldFocusSearch(false);
    }
  }, [shouldFocusSearch]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }

    const subscription = dateService.getDate().subscribe((date) => {
      setDateSelected(date);
      const formattedDate = date.toISOString().split("T")[0];
      navigate(`/dashboard/reservations?dayselected=${formattedDate}`);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("darkMode", JSON.stringify(newTheme));
    document.documentElement.classList.toggle("dark", newTheme);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    searchService.setSearch(value);

    // Toujours naviguer vers la page clients, même si la recherche est vide
    // Cela permettra à l'utilisateur de voir tous les clients quand il efface la recherche
    navigate("/dashboard/clients");
  };

  const getLinkClass = (path: string) => {
    return location.pathname.startsWith(path)
      ? "flex flex-col items-center text-red-500 dark:text-white transition duration-300"
      : "flex flex-col items-center text-gray-600 hover:text-red-500 dark:hover:text-white transition duration-300";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDateSelect = (date: Date) => {
    dateService.setDate(date);
  };

  const toggleNav = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setIsNavOpen(newIsOpen);
    if (!newIsOpen) {
      setShouldFocusSearch(false);
    }
  };

  const openNavAndFocusSearch = () => {
    setIsOpen(true);
    setIsNavOpen(true);
    setShouldFocusSearch(true);
  };

  const logoSrc = darkMode
    ? "/img/logo-oresto-white.png"
    : "/img/logo-oresto-red.png";

  return (
    <div className="flex justify-center pt-12">
      <div
        className={`bg-light dark:bg-dark-900 dark:text-white h-screen flex flex-col items-center justify-center gap-12 shadow-2xl fixed top-0 left-0 transition-all duration-300 ease-in-out z-60 ${
          isOpen ? "w-72" : "w-16"
        }`}
      >
        {/* Logo et nom du restaurant */}
        {isOpen && (
          <div className="flex flex-col gap-8 pt-10 justify-center items-center">
            <Link to="/dashboard/reservations">
              <img
                src={logoSrc}
                width="220px"
                alt="Oresto - Gestion des réservations"
              />
            </Link>
            {restaurant && (
              <h1 className="text-center font-bold">{restaurant.name}</h1>
            )}
          </div>
        )}

        {/* Calendrier */}
        {isOpen && (
          <div className="px-4">
            <CalendarShadcn
              mode="single"
              selected={dateSelected}
              onSelect={handleDateSelect}
              interfaceType="restaurant"
              required
            />
          </div>
        )}

        {/* Formulaire de recherche */}
        {isOpen && (
          <form className="flex flex-col items-center px-4 w-full">
            <div className="w-full flex flex-col items-center mb-8">
              <label htmlFor="search" className="text-base font-bold mb-2">
                Recherche par nom
              </label>
              <input
                type="text"
                name="name"
                id="search"
                placeholder="Saisir le nom du client"
                value={searchTerm}
                onChange={handleSearchChange}
                ref={searchInputRef}
                className="border-2 border-gray-300 p-1 w-[220px] text-center dark:text-white dark:bg-dark-800 dark:border-dark-800"
              />
            </div>

            {/* Bouton de bascule de thème sous le champ de recherche */}
            <button
              onClick={toggleTheme}
              className="flex items-center mt-4 text-md font-semibold space-x-2"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <MdLightMode /> : <MdOutlineDarkMode />}
              <span>{darkMode ? "Thème clair" : "Thème sombre"}</span>
            </button>
          </form>
        )}

        {/* Éléments du menu */}
        <div className="flex-grow flex flex-col items-center justify-center">
          {isOpen ? (
            <div className="grid grid-cols-2 gap-5">
              {/* Réservations */}
              <Link
                to={`/dashboard/reservations?dayselected=${
                  dateSelected.toISOString().split("T")[0]
                }`}
                className={getLinkClass("/dashboard/reservations")}
              >
                <BsListCheck size={23} className="mb-1" />
                <h2 className="text-xs font-bold">Réservations</h2>
              </Link>

              {/* Plan de table */}
              <Link
                to="/dashboard/table_plan"
                className={getLinkClass("/dashboard/table_plan")}
              >
                <LuLayoutDashboard size={23} className="mb-1" />
                <h2 className="text-xs font-bold">Plan de table</h2>
              </Link>

              {/* Gestion clients */}
              <Link
                to="/dashboard/clients"
                className={getLinkClass("/dashboard/clients")}
              >
                <FaUsers size={23} className="mb-1" />
                <h2 className="text-xs font-bold">Gestion clients</h2>
              </Link>

              {/* Statistiques */}
              <Link
                to="/dashboard/analytics"
                className={getLinkClass("/dashboard/analytics")}
              >
                <IoMdStats size={23} className="mb-1" />
                <h2 className="text-xs font-bold">Statistiques</h2>
              </Link>

              {/* Paramètres */}
              <Link
                to="/dashboard/settings"
                className={getLinkClass("/dashboard/settings")}
              >
                <FaGear size={23} className="mb-1" />
                <h2 className="text-xs font-bold">Paramètres</h2>
              </Link>

              {/* Se déconnecter */}
              <Link
                to="/login"
                onClick={handleLogout}
                className={getLinkClass("/login")}
              >
                <MdLogout size={23} className="mb-1" />
                <h2 className="text-xs font-bold">Se déconnecter</h2>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-8">
              {/* Calendrier */}
              <Tippy content="Afficher le calendrier" placement="right">
                <button
                  onClick={toggleNav}
                  className="flex flex-col items-center text-gray-600 hover:text-red-500 dark:hover:text-white transition duration-300 focus:outline-none"
                >
                  <FaCalendarAlt size={23} className="mb-1" />
                </button>
              </Tippy>

              {/* Recherche */}
              <Tippy content="Rechercher un client" placement="right">
                <button
                  onClick={openNavAndFocusSearch}
                  className="flex flex-col items-center text-gray-600 hover:text-red-500 dark:hover:text-white transition duration-300 focus:outline-none"
                >
                  <FaSearch size={23} className="mb-1" />
                </button>
              </Tippy>

              {/* Réservations */}
              <Tippy content="Réservations" placement="right">
                <Link
                  to={`/dashboard/reservations?dayselected=${
                    dateSelected.toISOString().split("T")[0]
                  }`}
                  className={getLinkClass("/dashboard/reservations")}
                >
                  <BsListCheck size={23} className="mb-1" />
                </Link>
              </Tippy>

              {/* Plan de table */}
              <Tippy content="Plan de table" placement="right">
                <Link
                  to="/dashboard/table_plan"
                  className={getLinkClass("/dashboard/table_plan")}
                >
                  <LuLayoutDashboard size={23} className="mb-1" />
                </Link>
              </Tippy>

              {/* Gestion clients */}
              <Tippy content="Gestion clients" placement="right">
                <Link
                  to="/dashboard/clients"
                  className={getLinkClass("/dashboard/clients")}
                >
                  <FaUsers size={23} className="mb-1" />
                </Link>
              </Tippy>

              {/* Statistiques */}
              <Tippy content="Statistiques" placement="right">
                <Link
                  to="/dashboard/analytics"
                  className={getLinkClass("/dashboard/analytics")}
                >
                  <IoMdStats size={23} className="mb-1" />
                </Link>
              </Tippy>

              {/* Paramètres */}
              <Tippy content="Paramètres" placement="right">
                <Link
                  to="/dashboard/settings"
                  className={getLinkClass("/dashboard/settings")}
                >
                  <FaGear size={23} className="mb-1" />
                </Link>
              </Tippy>

              {/* Se déconnecter */}
              <Tippy content="Se déconnecter" placement="right">
                <Link
                  to="/login"
                  onClick={handleLogout}
                  className={getLinkClass("/login")}
                >
                  <MdLogout size={23} className="mb-1" />
                </Link>
              </Tippy>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de bascule */}
      <Tippy content="Afficher / Masquer le menu" placement="right">
        <button
          onClick={toggleNav}
          className={clsx(
            "fixed top-1/2 transform -translate-y-1/2 bg-white dark:bg-dark-800 p-2 dark:border-dark-700 rounded-md shadow-lg focus:outline-none transition-transform duration-300 ease-in-out bg-opacity-100 z-50",
            isOpen
              ? "left-[308px] -translate-x-1/2"
              : "left-[83px] -translate-x-1/2",
          )}
        >
          {isOpen ? <MdArrowLeft size={25} /> : <MdArrowRight size={25} />}
        </button>
      </Tippy>
    </div>
  );
};
