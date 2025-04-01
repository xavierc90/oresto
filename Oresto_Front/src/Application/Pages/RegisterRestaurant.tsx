import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../Infrastructure/Http/axios.instance";
import { useAuth } from "../../Module/Auth/useAuth";

export const RegisterRestaurant = () => {
  useEffect(() => {
    document.title = "Oresto - Créer une entreprise";
  }, []);

  const { user, loginManager } = useAuth();
  const [formData, setFormData] = useState({
    restaurantName: "",
    restaurantAddress: "",
    restaurantPostalCode: "",
    restaurantCity: "",
    restaurantCountry: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const navigate = useNavigate();

  const handleRestaurantCreation = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!user) {
      // Vérifiez si user est disponible
      console.error("Erreur : L'utilisateur n'est pas connecté.");
      setErrorMessage("Vous devez être connecté pour créer une entreprise.");
      return;
    }

    const restaurantData = {
      name: formData.restaurantName,
      address: formData.restaurantAddress,
      postal_code: formData.restaurantPostalCode,
      city: formData.restaurantCity,
      country: formData.restaurantCountry,
      user_id: user._id, // Utiliser l'ID utilisateur provenant du hook useAuth
    };

    try {
      const response = await http.post("/add_restaurant", restaurantData);

      console.log("Réponse du serveur:", response);

      if (response.status === 201) {
        // Mettre à jour les informations de l'utilisateur avec le nouveau restaurant
        loginManager(user, [response.data]);

        alert("Entreprise créée avec succès !");
        navigate("/dashboard/reservations");
      } else {
        console.error("Erreur lors de la création de l'entreprise :", response);
        setErrorMessage(
          "Une erreur est survenue lors de la création de l'entreprise.",
        );
      }
    } catch (error: Error | unknown) {
      console.error(
        "Erreur lors de la requête de création de l'entreprise :",
        error,
      );
      setErrorMessage(
        "Une erreur est survenue lors de la création de l'entreprise.",
      );
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="cover-restaurant w-6/12"></div>
      <div className="w-6/12 bg-light">
        <div className="flex flex-col items-center justify-center h-screen">
          <a href="/login">
            <img
              src="/img/logo-oresto-red.png"
              width="300px"
              alt="Logo Oresto"
            />
          </a>
          <form
            method="POST"
            className="flex flex-col mt-10"
            onSubmit={handleRestaurantCreation}
          >
            <div className="flex flex-col w-[390px] justify-center items-center">
              <h2 className="text-center mb-10">
                Renseignez les informations de votre restaurant pour accéder à
                votre espace restaurateur et gérer vos réservations.
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label className="text-lg font-bold mb-2">
                  Nom du restaurant :
                </label>
                <input
                  type="text"
                  placeholder="Exemple : La belle assiette"
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange(e, "restaurantName")}
                  className={`border-2 w-[300px] p-2 mb-6 text-sm font-bold ${
                    formData.restaurantName.trim() !== ""
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            <label className="text-lg font-bold mb-2">Adresse :</label>
            <input
              type="text"
              placeholder="Adresse"
              value={formData.restaurantAddress}
              onChange={(e) => handleInputChange(e, "restaurantAddress")}
              className={`border-2 p-2 mb-6 text-sm w-[360px] font-bold ${
                formData.restaurantAddress.trim() !== ""
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            />
            <div className="flex items-center justify-left gap-4">
              <div className="flex flex-col">
                <label className="text-lg font-bold mb-2">Code postal :</label>
                <input
                  type="text"
                  placeholder="Code postal"
                  value={formData.restaurantPostalCode}
                  onChange={(e) => handleInputChange(e, "restaurantPostalCode")}
                  className={`border-2 p-2 mb-6 w-[120px] text-sm font-bold ${
                    formData.restaurantPostalCode.trim() !== ""
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-lg font-bold mb-2">Ville :</label>
                <input
                  type="text"
                  placeholder="Ville"
                  value={formData.restaurantCity}
                  onChange={(e) => handleInputChange(e, "restaurantCity")}
                  className={`border-2 p-2 mb-6 text-sm font-bold ${
                    formData.restaurantCity.trim() !== ""
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            <label className="text-lg font-bold mb-2">Pays :</label>
            <input
              type="text"
              placeholder="Pays"
              value={formData.restaurantCountry}
              onChange={(e) => handleInputChange(e, "restaurantCountry")}
              className={`border-2 p-2 mb-6 text- w-[200px] sm font-bold ${
                formData.restaurantCountry.trim() !== ""
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            />
            <div className="flex flex-col items-center justify-center">
              {errorMessage && (
                <div className="text-red-500 text-center">{errorMessage}</div>
              )}
              <button
                type="submit"
                className={`bg-black text-white py-4 rounded-lg w-2/3 mt-5 font-bold uppercase ${
                  formData.restaurantName.trim() !== "" &&
                  formData.restaurantAddress.trim() !== "" &&
                  formData.restaurantPostalCode.trim() !== "" &&
                  formData.restaurantCity.trim() !== "" &&
                  formData.restaurantCountry.trim() !== ""
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
                disabled={
                  !(
                    formData.restaurantName.trim() !== "" &&
                    formData.restaurantAddress.trim() !== "" &&
                    formData.restaurantPostalCode.trim() !== "" &&
                    formData.restaurantCity.trim() !== "" &&
                    formData.restaurantCountry.trim() !== ""
                  )
                }
              >
                Valider l'inscription
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
