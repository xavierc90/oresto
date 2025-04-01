import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
// import { http } from '../../Infrastructure/Http/axios.instance';

export const LostPasswordPage = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Oresto - Mot de passe perdu";
  }, []);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(email);
  };

  return (
    <div className="w-full h-screen flex">
      <div className="w-6/12 bg-light">
        <div className="flex flex-col items-center justify-center h-screen">
          <a href="/login">
            <img
              src="/img/logo-oresto-red.png"
              width="300px"
              alt="Logo Oresto"
            />
          </a>
          <form className="flex flex-col w-80 mt-10" onSubmit={handleSubmit}>
            <label className="text-xl font-bold mb-4 text-left" htmlFor="email">
              Votre adresse mail
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Saisissez votre adresse mailt"
              className="border-2 border-gray-300 p-2 mb-6 font-bold"
              value={email}
              onChange={handleEmailChange}
            />
            <button
              type="submit"
              className={`p-4 rounded-lg w-full font-bold uppercase ${
                email ? "bg-black text-white" : "bg-gray-300 text-gray-500"
              }`}
              disabled={!email}
            >
              Récupérer le mot de passe
            </button>
          </form>
          <NavLink to="/login" className="pt-10 underline">
            Retour à la page de connexion
          </NavLink>
        </div>
      </div>
      <div className="cover-login w-6/12"></div>
    </div>
  );
};
