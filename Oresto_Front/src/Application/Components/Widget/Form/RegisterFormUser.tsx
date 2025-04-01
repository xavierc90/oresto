import React, { Dispatch, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import useRegister from "../../../../Module/Auth/register.hook"; // Assurez-vous d'importer le hook correctement
import { TermsOfService } from "../../TermsOfService";
import ArrowButton from "./ArrowButton";
import CloseButton from "./CloseButton";

// Définitions des types pour les props
type RegisterFormUserProps = {
  setIsLoging: Dispatch<React.SetStateAction<boolean>>;
  isContentVisible: boolean;
  setIsContentVisible: (visible: boolean) => void;
  setShowWidget: (visible: boolean) => void;
};

export const RegisterFormUser: React.FC<RegisterFormUserProps> = ({
  setIsLoging,
  isContentVisible,
  setIsContentVisible,
  setShowWidget,
}) => {
  // États pour stocker les valeurs du formulaire
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour gérer l'ouverture des modales
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  // État pour suivre l'étape actuelle
  const [step, setStep] = useState(1);

  // État pour suivre l'état de l'inscription
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Utilisation du hook d'inscription
  const { register, isRegistering, error, successMessage } = useRegister();

  // Fonction pour gérer le passage à l'étape suivante
  const handleNextStep = () => {
    if (firstname && lastname && email && phoneNumber) {
      setStep(2);
    } else {
      alert("Veuillez remplir tous les champs avant de continuer.");
    }
  };

  // Fonction pour gérer la soumission du formulaire final
  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const result = await register({
      firstName: firstname,
      lastName: lastname,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });

    if (result.success) {
      setFirstname("");
      setLastname("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      setRegistrationSuccess(true);
    } else {
      // Si l'inscription échoue, vous pouvez afficher un message d'erreur ici
      setRegistrationSuccess(false);
    }
  };

  // Gestion de la visibilité des mots de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validation des conditions du mot de passe
  const isLongEnough = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const passwordsMatch = password === confirmPassword;

  // Fonctions pour gérer la visibilité et la fermeture du widget
  const handleClose = () => {
    setShowWidget(false); // Masquer le widget en mettant à jour l'état dans HomePage
  };

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible); // Bascule la visibilité du contenu
  };

  return (
    <div className="flex flex-col justify-center items-center bg-white w-full h-screen lg:w-auto lg:h-auto transition-all duration-500">
      <div className="fixed flex top-5 right-4 mr-2 gap-2 lg:hidden">
        <ArrowButton
          isContentVisible={isContentVisible}
          onClick={toggleContentVisibility}
        />
        <CloseButton onClick={handleClose} />
      </div>
      {step === 1 && (
        <>
          <h1 className="text-center text-lg font-bold pt-8 lg:pt-2">
            Inscription rapide
          </h1>
          <h2 className="text-center text-sm pt-2 w-3/4 ">
            Créer un compte vous permet de réserver facilement dans votre
            restaurant
          </h2>
          <form className="flex flex-col justify-center items-center mt-2">
            <div className="flex flex-col w-full">
              <label
                htmlFor="firstName"
                className="font-bold items-left text-left lg:text-sm"
              >
                Prénom :
              </label>
              <input
                value={firstname}
                onChange={(e) => setFirstname(e.currentTarget.value)}
                type="text"
                id="firstName"
                name="firstName"
                placeholder="François"
                className="border-2 border-gray-300 rounded-lg w-full p-2 mt-1 mb-4 font-bold text-sm"
              />
            </div>
            <div className="flex flex-col w-full">
              <label
                htmlFor="lastName"
                className="font-bold text-left lg:text-sm"
              >
                Nom :
              </label>
              <input
                value={lastname}
                onChange={(e) => setLastname(e.currentTarget.value)}
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Dupont"
                className="border-2 border-gray-300 rounded-lg w-full p-2 mt-2 mb-4 font-bold lg:text-sm"
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="email" className="font-bold text-left lg:text-sm">
                Adresse mail :
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                type="email"
                id="email"
                name="email"
                placeholder="f.dupont@gmail.com"
                className="border-2 border-gray-300 rounded-lg w-full p-2 mt-2 mb-4 font-bold lg:text-sm"
              />
            </div>

            <div className="flex flex-col w-full">
              <label
                htmlFor="phone_number"
                className="font-bold text-left lg:text-sm"
              >
                N° de téléphone :
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                type="tel"
                id="phone_number"
                name="phone_number"
                placeholder="Exemple : 0102030405"
                className="border-2 border-gray-300 rounded-lg w-full p-2 mt-2 mb-4 font-bold lg:text-sm"
              />
            </div>

            <div className="text-center">
              <input type="checkbox" name="cgu" id="cgu" className="mr-2" />
              <span className="text-sm">
                J'accepte les{" "}
                <a
                  onClick={() => setIsTermsOpen(true)}
                  className="text-black font-bold hover:text-green-700 underline cursor-pointer"
                >
                  conditions d'utilisation
                </a>
              </span>
            </div>

            <button
              onClick={handleNextStep}
              type="button"
              className="bg-black rounded-lg text-white py-2 px-5 w-full mt-4 mb-4 font-bold text-sm"
            >
              Créer un mot de passe
            </button>
          </form>
          {/* Modal pour les Conditions Générales */}
          {isTermsOpen && (
            <TermsOfService onClose={() => setIsTermsOpen(false)} />
          )}
          <div className="w-full text-center">
            <button
              onClick={() => setIsLoging(true)}
              className="hover:text-green-700 underline text-sm"
            >
              <div className="w-60">
                Vous avez déjà un compte ? Connectez-vous
              </div>
            </button>
          </div>
        </>
      )}

      {step === 2 && !registrationSuccess && (
        <>
          <h1 className="text-center text-xl font-bold">
            Créez votre mot de passe
          </h1>
          <h2 className="text-center text-sm pt-5 w-3/4">
            Assurez-vous que le mot de passe saisi respecte les conditions
            mentionnées plus bas
          </h2>
          <form className="flex flex-col justify-center items-center mt-8">
            <div className="flex flex-col w-full relative">
              <label
                htmlFor="password"
                className="font-bold items-left text-left mb-1"
              >
                Mot de passe
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Saisissez un mot de passe"
                className="border-2 border-gray-300 rounded-lg w-full p-2 font-bold pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-11"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex flex-col w-full relative">
              <label
                htmlFor="confirmPassword"
                className="font-bold mb-1 mt-8 text-left"
              >
                Confirmez le mot de passe
              </label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmez le mot de passe"
                className="border-2 border-gray-300 rounded-lg w-full p-2 font-bold pr-10"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-4 top-12 pt-7"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="text-left mb-4 mt-5">
              <p className="font-bold mb-1 mt-4">
                Le mot de passe doit contenir :
              </p>
              <ul className="text-sm">
                <li className="flex items-center">
                  {isLongEnough ? (
                    <FaCheckCircle className="text-green-800 mr-2" />
                  ) : (
                    <FaTimesCircle className="text-gray-300 mr-2" />
                  )}
                  Au moins 6 caractères
                </li>
                <li className="flex items-center">
                  {hasNumber ? (
                    <FaCheckCircle className="text-green-800 mr-2" />
                  ) : (
                    <FaTimesCircle className="text-gray-300 mr-2" />
                  )}
                  Un chiffre entre 0 et 9
                </li>
                <li className="flex items-center">
                  {hasSpecialChar ? (
                    <FaCheckCircle className="text-green-800 mr-2" />
                  ) : (
                    <FaTimesCircle className="text-gray-300 mr-2" />
                  )}
                  Un caractère spécial
                </li>
                <li className="flex items-center">
                  {hasUpperCase ? (
                    <FaCheckCircle className="text-green-800 mr-2" />
                  ) : (
                    <FaTimesCircle className="text-gray-300 mr-2" />
                  )}
                  Une majuscule
                </li>
              </ul>
            </div>

            {error && (
              <div className="w-full text-center text-red-600 mb-4">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="w-full text-center text-green-600 font-bold mb-4">
                {successMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              type="button"
              disabled={
                !isLongEnough ||
                !hasNumber ||
                !hasSpecialChar ||
                !hasUpperCase ||
                !passwordsMatch ||
                isRegistering
              }
              className={`${
                isLongEnough &&
                hasNumber &&
                hasSpecialChar &&
                hasUpperCase &&
                passwordsMatch &&
                !isRegistering
                  ? "bg-black text-white"
                  : "bg-gray-300 text-gray-400 cursor-not-allowed"
              } rounded-lg py-2 px-5 w-full mt-4 font-bold text-sm`}
            >
              {isRegistering
                ? "Enregistrement en cours..."
                : "Terminer l'inscription"}
            </button>
          </form>
          <div className="w-full text-center mt-8">
            <button
              onClick={() => setStep(1)} // Permet de revenir à l'étape précédente
              className="hover:text-black hover:underline text-sm"
            >
              Revenir à l'étape précédente
            </button>
          </div>
        </>
      )}

      {registrationSuccess && (
        <div className="flex flex-col justify-center items-center pt-5 pb-5 px-6 bg-white w-full h-auto">
          <img
            src="../../../publicimg/logo-oresto-orange.png"
            width="250px"
            alt="Logo Oresto"
          />
          <p className="text-green-800 font-bold text-base mt-8">
            Inscription réussie !
          </p>
          <h2 className="w-full text-center pt-5">
            Connectez-vous ou inscrivez-vous, c'est simple et rapide.
          </h2>
          <button
            onClick={() => setIsLoging(true)} // Si vous souhaitez rediriger vers la connexion après succès
            className="hover:text-black hover:underline text-sm"
          >
            Vous pouvez vous connecter maintenant
          </button>
        </div>
      )}
    </div>
  );
};
