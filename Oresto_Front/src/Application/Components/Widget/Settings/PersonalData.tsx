// components/User/PersonalData.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { http } from "../../../../Infrastructure/Http/axios.instance";
import { useAuth } from "../../../../Module/Auth/useAuth";

type PersonalDataProps = {
  onReturnToAccount: () => void;
};

export const PersonalData: React.FC<PersonalDataProps> = ({
  onReturnToAccount,
}) => {
  // Utiliser useAuth pour récupérer les informations de l'utilisateur connecté
  const { user, updateUser } = useAuth();

  // État pour les champs du formulaire
  const [formData, setFormData] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
    password: string;
  }>({
    firstname: "",
    lastname: "",
    email: "",
    phone_number: "",
    password: "",
  });

  // État pour les messages de succès et d'erreur
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialiser les champs du formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        password: "", // Utiliser une chaîne vide comme valeur par défaut
      });
    }
  }, [user]);

  // Gestion des changements dans les champs du formulaire
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Validation simple des données
  const validateForm = () => {
    if (!formData.firstname.trim()) {
      setErrorMessage("Le prénom est requis.");
      return false;
    }
    if (!formData.lastname.trim()) {
      setErrorMessage("Le nom de famille est requis.");
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage("L'email est requis.");
      return false;
    }
    // Ajoutez d'autres validations si nécessaire
    setErrorMessage(null);
    return true;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrorMessage("Utilisateur non authentifié.");
      return;
    }

    try {
      await http.put(
        `/update_user/${user._id}`, // Utilisation dynamique de l'ID de l'utilisateur
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone_number: formData.phone_number,
          // Supprimer le mot de passe car il n'existe pas sur le type User
        },
        // Les cookies sont envoyés automatiquement, pas besoin d'en-têtes
      );

      // Mise à jour des informations de l'utilisateur dans le contexte
      updateUser({
        ...user,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone_number: formData.phone_number,
      });

      setSuccessMessage("Vos informations ont été mises à jour avec succès.");
      setErrorMessage(null);
    } catch (error: Error | unknown) {
      console.error(
        "Erreur lors de la mise à jour des informations personnelles:",
        error,
      );
      setErrorMessage("Une erreur est survenue lors de la mise à jour.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <h2 className="text-lg font-bold mb-4">Mes données personnelles</h2>

      <form className="w-full" onSubmit={handleSubmit}>
        {/* Nom de Famille */}
        <div className="mb-4">
          <label
            htmlFor="lastname"
            className="block font-semibold text-left text-sm mb-2"
          >
            Nom de famille
          </label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-700 text-sm"
            required
          />
        </div>

        {/* Prénom */}
        <div className="mb-4">
          <label
            htmlFor="firstName"
            className="block font-semibold text-left text-sm mb-2"
          >
            Prénom
          </label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-700 text-sm"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block font-semibold text-left text-sm mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-700 text-sm"
            required
          />
        </div>

        {/* Téléphone */}
        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block font-semibold text-left text-sm mb-2"
          >
            Téléphone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-700 text-sm"
          />
        </div>

        {/* Messages de succès et d'erreur */}
        {successMessage && (
          <p className="mb-2 text-sm font-bold text-green-700 text-center">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mb-2 text-sm font-bold text-red-700 text-center">
            {errorMessage}
          </p>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-green-800 text-white py-2 px-4 rounded-lg text-sm mt-3 font-semibold "
        >
          Enregistrer les modifications
        </button>
      </form>

      {/* Bouton de retour */}
      <div className="mt-4 w-full text-center">
        <button
          className="bg-black text-white py-2 px-4 rounded-lg text-sm font-semibold"
          onClick={onReturnToAccount}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};
