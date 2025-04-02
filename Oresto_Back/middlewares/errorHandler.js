const Logger = require("../utils/logger").pino;

// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  // Log l'erreur
  Logger.error({
    message: err.message,
    stack: err.stack,
    type_error: err.type_error || "server_error",
    path: req.path,
    method: req.method,
  });

  // Déterminer le code de statut HTTP
  const statusCode = err.statusCode || 500;

  // Préparer la réponse d'erreur
  const errorResponse = {
    success: false,
    message: err.message || "Une erreur inattendue s'est produite",
    type_error: err.type_error || "server_error",
  };

  // En développement, inclure plus de détails
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || {};
  }

  // Envoyer la réponse
  res.status(statusCode).json(errorResponse);
};

// Classe personnalisée pour les erreurs d'API
class APIError extends Error {
  constructor(
    message,
    statusCode = 500,
    type_error = "server_error",
    details = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type_error = type_error;
    this.details = details;
    this.name = "APIError";
  }
}

module.exports = {
  errorHandler,
  APIError,
};
