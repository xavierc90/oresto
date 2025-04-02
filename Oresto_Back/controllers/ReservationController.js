const ReservationService = require("../services/ReservationService");
const TablePlanService = require("../services/TablePlanService");
const moment = require("moment");
const { APIError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger").pino;

// Fonction du contrôleur pour ajouter une réservation
module.exports.addOneReservation = async (req, res) => {
  console.log("=== Controller addOneReservation ===");
  console.log("Restaurant reçu du middleware:", req.restaurant);

  try {
    // Récupérer le restaurant validé par le middleware
    const restaurant = req.restaurant;

    // Extraire les données de la demande de réservation
    const { date_selected, time_selected, nbr_persons, details } = req.body;
    const user_id = req.user ? req.user.id : null;
    const restaurant_id = restaurant.id;

    console.log("Données de réservation complètes:", {
      date_selected,
      time_selected,
      nbr_persons,
      user_id,
      restaurant_id,
      details,
    });

    console.log("=== Vérification de la disponibilité ===");

    // Appeler le service pour créer la réservation avec des promesses
    const reservation = await ReservationService.addOneReservation({
      date_selected,
      time_selected,
      nbr_persons,
      user_id,
      restaurant_id,
      details,
    });

    // Extraire les données de la réservation, gérer à la fois les objets Mongoose et les objets simples
    const reservationData = reservation._doc ? reservation._doc : reservation;

    // Répondre avec la réservation créée, en ajoutant la table sous un format compatible avec le frontend
    return res.status(201).json({
      success: true,
      data: {
        ...reservationData,
        table: [
          {
            table_number: reservationData.table_number,
          },
        ],
      },
    });
  } catch (error) {
    // Vérifier si c'est une erreur API personnalisée
    if (error.statusCode && error.type_error) {
      // Utiliser le logger correctement (pino a des méthodes comme info, error, etc.)
      logger.error({
        msg: error.message,
        stack: error.stack,
        type_error: error.type_error,
        path: req.path,
        method: req.method,
      });

      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          type: error.type_error,
          details: error.details || {},
        },
      });
    }

    // Pour les erreurs non spécifiques
    logger.error({
      msg: "Erreur lors de la création de la réservation.",
      type_error: "unknown_error",
      path: req.path,
      method: req.method,
      original_error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: {
        message: "Erreur lors de la création de la réservation.",
        type: "unknown_error",
      },
    });
  }
};

// Fonction du contrôleur pour confirmer une réservation
module.exports.confirmReservation = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const reservationResult = await new Promise((resolve, reject) => {
      ReservationService.confirmReservation(reservationId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Formater la réponse pour le frontend
    const reservation = reservationResult._doc
      ? reservationResult._doc
      : reservationResult;

    res.status(200).json({
      message: "Reservation confirmed successfully.",
      reservation: {
        ...reservation,
        table: [
          {
            table_number: reservation.table_number,
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Fonction du contrôleur pour annuler une réservation
module.exports.cancelReservation = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const reservation = await new Promise((resolve, reject) => {
      ReservationService.cancelReservation(reservationId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    res.status(200).json({
      message: "Reservation canceled successfully.",
      reservation: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Fonction du contrôleur pour archiver une réservation
module.exports.archiveReservation = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const reservation = await new Promise((resolve, reject) => {
      ReservationService.archiveReservation(reservationId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    res.status(200).json({
      message: "Reservation archived successfully.",
      reservation: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Contrôleur pour rechercher les réservations par date et restaurant_id
module.exports.findReservationsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const user = req.user;
    const restaurantId = user.restaurant_id || user.restaurant;

    if (!date) {
      throw new APIError("La date est requise.", 400, "validation_error");
    }

    if (!restaurantId) {
      throw new APIError(
        "L'ID du restaurant est manquant dans les données de l'utilisateur.",
        400,
        "validation_error",
      );
    }

    const reservations = await new Promise((resolve, reject) => {
      ReservationService.findReservationsByDate(
        date,
        restaurantId,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
    });

    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

// Contrôleur pour rechercher les réservations par ID utilisateur
module.exports.findReservationsByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new APIError("User ID is required.", 400, "validation_error");
    }

    const reservationsResult = await new Promise((resolve, reject) => {
      ReservationService.findReservationsByUserId(id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Formater chaque réservation pour s'assurer que table est dans le format attendu
    const formattedReservations = reservationsResult.map((reservation) => {
      const reservationData = reservation._doc ? reservation._doc : reservation;

      // Si la table virtuelle n'est pas peuplée, créer un objet table avec table_number
      if (
        !reservationData.table ||
        !Array.isArray(reservationData.table) ||
        reservationData.table.length === 0
      ) {
        return {
          ...reservationData,
          table: [
            {
              table_number: reservationData.table_number,
            },
          ],
        };
      }

      return reservationData;
    });

    res.status(200).json(formattedReservations);
  } catch (error) {
    next(error);
  }
};

// Contrôleur pour récupérer toutes les réservations et compter par statut
module.exports.findAllReservations = async (req, res, next) => {
  try {
    const result = await new Promise((resolve, reject) => {
      ReservationService.findAllReservations((err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
