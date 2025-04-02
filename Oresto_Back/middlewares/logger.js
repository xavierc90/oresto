const Logger = require("../utils/logger").pino;
const { APIError } = require("./errorHandler");

module.exports.addLogger = async (req, res, next) => {
  try {
    if (!req.log) {
      req.log = Logger;
    }
    next();
  } catch (error) {
    next(
      new APIError(
        "Erreur lors de l'initialisation du logger",
        500,
        "logger_error",
        { originalError: error.message },
      ),
    );
  }
};
