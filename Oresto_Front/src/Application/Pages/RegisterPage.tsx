import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { http } from "../../Infrastructure/Http/axios.instance";
import { AxiosError } from "axios";
import { TermsOfService } from "../Components/TermsOfService";
import { CookieBanner } from "../Components/CookieBanner";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Oresto - Inscription restaurateur";
  }, []);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(event.target.checked);
  };

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    isCheckboxChecked;

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setState(event.target.value);
  };

  const formatPhoneNumber = (value: string) => {
    // Retirer les espaces déjà présents
    const cleaned = value.replace(/\s+/g, "");

    // Ajouter un espace après chaque groupe de deux chiffres
    const formatted = cleaned.match(/.{1,2}/g)?.join(" ") || cleaned;

    return formatted;
  };

  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const formattedPhoneNumber = formatPhoneNumber(inputValue);
    setPhoneNumber(formattedPhoneNumber);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) {
      setErrorMessage("Veuillez remplir tous les champs correctement.");
      return;
    }

    const managerData = {
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone_number: phoneNumber, // Garder le numéro avec les espaces
      password: password,
    };

    try {
      const registerResponse = await http.post(
        "/register_manager",
        managerData,
      );
      if (registerResponse.status === 201) {
        localStorage.setItem(
          "successMessage",
          "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        );
        navigate("/login");
      } else {
        setErrorMessage("Une erreur est survenue lors de l'inscription.");
      }
    } catch (error: unknown) {
      const e = error as AxiosError<{ message: string }>;
      if (e.response && e.response.data) {
        setErrorMessage(
          e.response.data.message || "Une erreur réseau est survenue",
        );
      } else {
        setErrorMessage("Erreur réseau ou serveur non atteignable");
      }
      console.error("Erreur lors de l'inscription:", e);
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="cover-register w-6/12"></div>
      <div className="w-6/12 bg-light">
        <div className="flex flex-col items-center justify-center h-screen">
          <a href="/login">
            <img
              src="/img/logo-oresto-red.png"
              width="300px"
              alt="Logo Oresto"
            />
          </a>

          {errorMessage && (
            <div className="text-red-500 text-center pt-4">{errorMessage}</div>
          )}

          <form method="POST" className="flex flex-col" onSubmit={handleSubmit}>
            <div className="flex gap-4 pt-10">
              <div className="flex flex-col">
                <label className="text-lg font-bold mb-2" htmlFor="firstname">
                  Prénom :
                </label>
                <input
                  type="text"
                  name="firstname"
                  id="firstname"
                  placeholder="Exemple : John"
                  value={firstName}
                  onChange={(e) => handleInputChange(e, setFirstName)}
                  className={`border-2 p-2 mb-6 font-bold text-sm ${
                    firstName.trim() !== ""
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-lg font-bold mb-2" htmlFor="lastname">
                  Nom :
                </label>
                <input
                  type="text"
                  name="lastname"
                  id="lastname"
                  placeholder="Exemple : Doe"
                  value={lastName}
                  onChange={(e) => handleInputChange(e, setLastName)}
                  className={`border-2 p-2 mb-6 font-bold text-sm ${
                    lastName.trim() !== ""
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            <label className="text-lg font-bold mb-2" htmlFor="email">
              Adresse mail
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Exemple : mail@monrestaurant.fr"
              value={email}
              onChange={(e) => handleInputChange(e, setEmail)}
              className={`border-2 p-2 mb-6 font-bold text-sm ${
                email.trim() !== "" ? "border-green-500" : "border-gray-300"
              }`}
            />

            <label className="text-lg font-bold mb-2" htmlFor="phoneNumber">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              placeholder="Exemple : 06 12 34 56 78"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={`border-2 p-2 mb-6 font-bold text-sm ${
                phoneNumber.trim() !== ""
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            />

            <label className="text-lg font-bold mb-2" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Saisissez un mot de passe"
              value={password}
              onChange={(e) => handleInputChange(e, setPassword)}
              className={`border-2 p-2 mb-4 font-bold text-sm ${
                password.trim() !== "" ? "border-green-500" : "border-gray-300"
              }`}
            />

            <label className="text-lg font-bold mb-2" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={(e) => handleInputChange(e, setConfirmPassword)}
              className={`border-2 p-2 mb-2 font-bold text-sm ${
                confirmPassword.trim() !== "" && password === confirmPassword
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            />

            <div className="flex flex-col items-center justify-center">
              <div className="my-4">
                <input
                  type="checkbox"
                  name="cgu"
                  id="cgu"
                  className="mr-2"
                  checked={isCheckboxChecked}
                  onChange={handleCheckboxChange}
                />
                J'accepte les{" "}
                <a
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:underline cursor-pointer font-bold"
                >
                  Conditions générales
                </a>
              </div>
              <CookieBanner />
              {isTermsOpen && (
                <TermsOfService onClose={() => setIsTermsOpen(false)} />
              )}

              <button
                type="submit"
                className={`bg-black text-white py-4 rounded-lg px-5 font-bold uppercase ${
                  isFormValid
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-70"
                }`}
                disabled={!isFormValid}
              >
                Continuer l'inscription
              </button>
            </div>
          </form>
          <div className="pt-4">
            <NavLink to="/login" className={"underline"}>
              Déjà un compte ? Connectez-vous
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
