import { Link } from "react-router-dom";
const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404 - Page non trouvée</h1>
      <p className="text-lg">
        Désolé, la page que vous recherchez n'existe pas.
      </p>
      <Link to="/" className="text-blue-500 hover:text-blue-700">
        Retour à la page d'accueil
      </Link>
    </div>
  );
};

export default NotFoundPage;
