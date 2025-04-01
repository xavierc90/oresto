import { useEffect, useState } from "react";
import { WidgetInitializer } from "../Components/Widget/WidgetInitializer";
import { RxHamburgerMenu, RxCross1 } from "react-icons/rx"; // Importer les icônes

export const HomePage = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false); // État pour la visibilité du menu
  const [showReservationWidget, setShowReservationWidget] = useState(false);
  const [restaurantId, setRestaurantId] = useState("67b54664eff3050a9f277522");

  const toggleRestaurantId = () => {
    setRestaurantId((prev) =>
      prev === "67b54664eff3050a9f277522"
        ? "67c6fa888860020f27e82739"
        : "67b54664eff3050a9f277522"
    );
  };

  const toggleMenuVisibility = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  const handleReservationClick = () => {
    setShowReservationWidget(true);
  };

  const handleCloseWidget = () => {
    setShowReservationWidget(false);
  };

  // Ajoute ou enlève la classe 'overflow-hidden' au body pour désactiver le défilement
  useEffect(() => {
    if (isMenuVisible) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuVisible]);

  return (
    <div>
      <header className="flex flex-col justify-center items-center">
        <nav
          className="fixed flex items-center justify-between top-0 w-full bg-black py-8 px-5 lg:px-10 z-10"
          aria-label="Menu principal"
        >
          <div className="text-white absolute">
            <a href="#" className="hover:text-white">
              <h1 className="bebas uppercase text-2xl lg:text-center">
                La belle assiette (fictif)
              </h1>
            </a>
          </div>
          <ul
            className={`fixed z-50 top-0 mt-5 right-0 w-full h-full flex flex-col justify-center items-center text-2xl font-bold bg-black text-white lg:static lg:mt-0 lg:flex-row lg:bg-transparent lg:justify-center lg:text-sm transition-transform duration-300 ${
              isMenuVisible
                ? "translate-x-0"
                : "translate-x-full lg:translate-x-0 translate-none"
            }`}
          >
            <li>
              <h1 className="pb-6 uppercase drop-shadow-xl lg:hidden">
                <a
                  href="#"
                  className="main-title text-center text-white hover:text-white"
                  onClick={closeMenu}
                >
                  La Belle Assiette
                </a>
              </h1>
            </li>
            <li className="p-4 lg:p-0">
              <h2 className="main-subtitle font-normal pb-5 lg:hidden">
                Restaurant &nbsp;traditionnel
              </h2>
            </li>
            <li className="lg:p-0">
              <a
                href="#about"
                className="hover:text-white block lg:inline uppercase hover:bg-green-800 hover:w-screen text-center py-5 px-5"
                onClick={closeMenu}
              >
                Le restaurant
              </a>
            </li>
            <li className="lg:p-0">
              <a
                href="#menu"
                className="hover:text-white block lg:inline uppercase hover:bg-green-800 hover:w-screen text-center py-5 px-5"
                onClick={closeMenu}
              >
                La carte
              </a>
            </li>
            <li className="lg:p-0">
              <a
                href="#contact"
                className="hover:text-white block lg:inline uppercase hover:bg-green-800 hover:w-screen text-center py-5 px-5"
                onClick={closeMenu}
              >
                Contact
              </a>
            </li>
            <li className="lg:p-0">
              <a
                className="hidden hover:text-white lg:inline cursor-pointer uppercase hover:bg-green-800 hover:w-screen text-center py-5 px-5"
                onClick={handleReservationClick}
              >
                Réserver
              </a>
            </li>
          </ul>
          <div className="absolute right-5 lg:hidden text-white z-50">
            {isMenuVisible ? (
              <RxCross1
                className="w-8 h-8 cursor-pointer"
                onClick={toggleMenuVisibility}
              />
            ) : (
              <RxHamburgerMenu
                className="w-8 h-8 cursor-pointer"
                onClick={toggleMenuVisibility}
              />
            )}
          </div>
        </nav>

        <div className="mt-20 lg:mt-0">
          <h1 className="main-title text-center text-white uppercase drop-shadow-xl">
            La Belle Assiette
          </h1>
          <p className="main-subtitle text-white text-center drop-shadow-xl">
            Restaurant &nbsp;traditionnel
          </p>
          <div className="flex gap-4 justify-center items-center mt-8">
            <button>
              <a
                href="#menu"
                className="btn-green uppercase hover:text-white text-sm"
              >
                Voir la carte
              </a>
            </button>
            <button>
              <a
                className="btn-light uppercase text-sm hover:text-black cursor-pointer"
                onClick={handleReservationClick}
              >
                Réserver en ligne
              </a>
            </button>
            <button
              onClick={toggleRestaurantId}
              className="btn-light uppercase text-sm"
            >
              CHANGER DE RESTAURANT (
              {restaurantId === "67c6fa888860020f27e82739"
                ? "Chez Hugo 2"
                : "La Belle Assiette"}
              )
            </button>
          </div>
        </div>
      </header>

      {showReservationWidget && (
        <div id="oresto-widget-container" data-restaurant-id={restaurantId}>
          <WidgetInitializer
            onClose={handleCloseWidget}
            restaurantId={restaurantId}
          />
        </div>
      )}

      <div
        id="about"
        className="bg-white py-16 px-4 flex flex-col justify-center items-center lg:h-screen"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <h2 className="main-subtitle text-3xl text-green-800 mb-8 text-center lg:text-left">
              Notre Restaurant
            </h2>
            <p className="lg:text-xl text-black">
              A la belle assiette, nous vous proposons une cuisine raffinée,
              préparée avec des ingrédients frais et de saison. Notre équipe
              dévouée est là pour vous offrir une expérience culinaire
              inoubliable, que ce soit pour un repas en famille, entre amis, ou
              pour un événement spécial.
            </p>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 md:pl-8">
            <img
              src="../../../public/img/cover-about.jpg"
              alt="Image du restaurant"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div
        id="menu"
        className="bg-gray-100 py-16 px-4 flex flex-col justify-center items-center lg:h-screen"
      >
        <h1 className="main-subtitle  text-lg mb-12 pt-12 text-green-800">
          Découvrez notre carte
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full">
          <div className="rounded-lg shadow-lg bg-white">
            <img
              src="../../../public/img/entree.jpg"
              alt="Entrées"
              className="w-full h-90 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-center font-bold mb-4">Entrées</h2>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <img
              src="../../../public/img/plats.jpg"
              alt="Plats"
              className="w-full h-50 object-cover rounded-t-lg mb-4"
            />
            <h2 className="font-bold mb-4 text-center">Plats</h2>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <img
              src="../../../public/img/dessert.jpg"
              alt="Desserts"
              className="w-full h-[295px] object-cover rounded-t-lg mb-4"
            />
            <h2 className="font-bold mb-4 text-center">Desserts</h2>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <img
              src="../../../public/img/boisson.jpg"
              alt="Boissons"
              className="w-full h-[300px] object-cover rounded-t-lg mb-4"
            />
            <h2 className="font-bold mb-4 text-center">Boissons</h2>
          </div>
        </div>
      </div>

      <div
        id="contact"
        className="bg-zinc-900 min-h-screen text-white flex flex-col justify-center items-center py-16 px-4"
      >
        <h1 className="main-subtitle text-white text-lg lg:mt-10 lg:mb-12">
          Nous contacter
        </h1>
        <div className="w-full max-w-4xl flex flex-wrap">
          <div className="w-full bg-zinc-950 flex flex-col justify-center lg:w-1/2 px-4 mt-12 lg:mt-0">
            <ul className="mb-4 list-none lg:pl-10">
              <li className="text-lg font-bold">Nos horaires</li>
              <li className="text-sm">
                Mardi à Vendredi : 12h00 - 14h00 | 20h00 - 23h00
              </li>
              <li className="text-sm">Samedi : 19h00 - 22h30</li>
              <li className="text-sm">Dimanche et lundi : Fermé</li>
            </ul>
            <ul className="mb-4 lg:pl-10">
              <li className="text-lg font-bold">Méthodes de paiement</li>
              <li className="text-sm">Carte de crédit, espèces</li>
            </ul>
            <ul className="mb-4 lg:pl-10">
              <li className="text-lg font-bold">N° de téléphone</li>
              <li className="text-sm">+33 1 23 45 67 89</li>
            </ul>
            <ul className="mb-4 lg:pl-10">
              <li className="text-lg font-bold">Adresse mail</li>
              <li className="text-sm">contact@labelleassiette.fr</li>
            </ul>
            <ul className="mb-4 lg:pl-10">
              <li className="text-lg font-bold">Adresse</li>
              <li className="text-sm">123 rue fictive, 75001 Paris, France</li>
            </ul>
          </div>
          <div className="w-full bg-black lg:w-1/2 p-7 lg:order-first">
            <form className="w-full max-w-lg rounded-lg shadow-lg">
              <h2 className="text-lg font-bold">Remplir le formulaire</h2>
              <h3 className="mb-4">Tous les champs doivent être remplis</h3>
              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                  <label
                    className="block text-white text-sm font-bold mb-2"
                    htmlFor="prenom"
                  >
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    className="w-full px-3 py-2 text-black rounded-md"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    className="block text-white text-sm font-bold mb-2"
                    htmlFor="nom"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    className="w-full px-3 py-2 text-black rounded-md"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  className="block text-white text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 text-black rounded-md"
                  placeholder="Votre e-mail"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-white text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-3 py-2 text-black rounded-md"
                  placeholder="Votre message"
                  required
                ></textarea>
              </div>
              <div className="flex justify-center lg:justify-center">
                <button
                  type="submit"
                  className="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Envoyer le message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer bottom-0 bg-black text-white w-full">
        <p className="text-center text-white text-sm py-2">
          Site créé par &nbsp;
          <a
            href="mailto:xavier.colombel@google.com?subject=Oresto%20-%20Contacter le développeur"
            className="font-bold hover:no-underline hover:text-white"
          >
            Xavier Colombel
          </a>
        </p>
        <ul className="flex justify-center text-sm gap-4">
          <li>
            <a href="#" className="underline">
              Accessibilité conforme
            </a>
          </li>
          <li>
            <a href="#" className="underline">
              Politique de confidentialité
            </a>
          </li>
          <li>
            <a href="#" className="underline">
              Conditions d'utilisations
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
};
