import React, { Dispatch, useState } from "react";
import ArrowButton from "./ArrowButton";
import CloseButton from "./CloseButton";
import { useAuth } from "../../../../Module/Auth/useAuth";

type LoginFormUserProps = {
  setIsLoging: Dispatch<React.SetStateAction<boolean>>;
  setIsLostPassword: Dispatch<React.SetStateAction<boolean>>;
  isContentVisible: boolean;
  setIsContentVisible: (visible: boolean) => void;
  setShowWidget: (visible: boolean) => void;
  onLoginSuccess: () => void;
};

export const LoginFormUser: React.FC<LoginFormUserProps> = ({
  setIsLoging,
  setIsLostPassword,
  isContentVisible,
  setIsContentVisible,
  setShowWidget,
  onLoginSuccess,
}) => {
  const { login, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleForgotPasswordClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    setIsLostPassword(true);
  };

  const handleClose = () => {
    setShowWidget(false);
  };

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await login(email, password);
      console.log("Connexion réussie:", result);
      onLoginSuccess();
    } catch (error: unknown) {
      setErrorMessage("Identifiant ou mot de passe incorrect.");
    }
  };

  return (
    <div className="flex flex-col z-50 justify-center items-center pt-5 pb-0 bg-white w-full h-screen lg:h-auto lg-w-auto">
      <div className="fixed flex top-5 right-4 mr-2 gap-2 lg:hidden">
        <ArrowButton
          isContentVisible={isContentVisible}
          onClick={toggleContentVisibility}
        />
        <CloseButton onClick={handleClose} />
      </div>
      <img
        src="./img/logo-oresto-orange.png"
        width="230px"
        alt="Logo Oresto"
      />

      {errorMessage && (
        <div className="text-red-600 text-sm mt-5 font-bold">
          {errorMessage}
        </div>
      )}

      <form
        className="flex flex-col justify-center items-center mt-4"
        onSubmit={handleLoginSubmit}
      >
        <div className="flex flex-col w-full">
          <label
            htmlFor="email"
            className="font-bold items-left text-left lg:text-sm mt-4"
          >
            Adresse mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john.doe@gmail.com"
            className="border-2 border-gray-300 rounded-lg w-full p-2 mt-2 mb-4 font-bold text-sm"
            required
          />
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="password" className="font-bold text-left lg:text-sm">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Votre mot de passe"
            className="border-2 border-gray-300 rounded-lg w-full p-2 mt-2 font-bold text-sm"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-black rounded-lg text-white py-2 px-2 mt-6 mb-4 font-bold text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
          <button
            type="button"
            className="bg-green-900 rounded-lg text-white py-2 px-4 mt-6 mb-4 font-bold text-sm"
            onClick={() => setIsLoging(false)}
          >
            S'inscrire
          </button>
        </div>
        <a
          href="#"
          onClick={handleForgotPasswordClick}
          className="hover:text-black text-sm lg:py-3 underline"
        >
          J'ai oublié mon mot de passe
        </a>
      </form>
    </div>
  );
};
