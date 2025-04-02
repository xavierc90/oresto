const TableReservation = require("../schemas/TableReservation");
const mongoose = require("mongoose");
const moment = require("moment");
const { APIError } = require("../middlewares/errorHandler");

// Création ou mise à jour d'une entrée TableReservation pour une date donnée
module.exports.addOneTableReservation = async function (
  tableReservationData,
  callback,
) {
  try {
    console.log("Données pour la TableReservation:", tableReservationData);

    // Vérifier si une entrée TableReservation existe déjà pour la date donnée
    let existingTableReservation = await TableReservation.findOne({
      date: tableReservationData.date,
      restaurant_id: tableReservationData.restaurant_id,
    });

    if (existingTableReservation) {
      let existingTable = existingTableReservation.tables.find((table) =>
        table.table_id.equals(tableReservationData.table_id),
      );

      if (existingTable) {
        const conflictingReservation = existingTable.reservations.some(
          (reservation) =>
            tableReservationData.occupied_start < reservation.occupied_end &&
            tableReservationData.occupied_end > reservation.occupied_start,
        );

        if (conflictingReservation) {
          throw new APIError(
            "Conflit détecté avec une réservation existante",
            409,
            "conflicting_reservation",
          );
        }

        // Ajouter la nouvelle réservation à la table existante
        existingTable.reservations.push({
          reservation_id: tableReservationData.reservation_id,
          status: tableReservationData.status || "waiting",
          occupied_start: tableReservationData.occupied_start,
          occupied_end: tableReservationData.occupied_end,
        });
      } else {
        // Si la table n'existe pas, ajouter la nouvelle table avec cette réservation
        existingTableReservation.tables.push({
          table_id: tableReservationData.table_id,
          reservations: [
            {
              reservation_id: tableReservationData.reservation_id,
              status: tableReservationData.status || "waiting",
              occupied_start: tableReservationData.occupied_start,
              occupied_end: tableReservationData.occupied_end,
            },
          ],
        });
      }

      await existingTableReservation.save();
      console.log(
        "Réservation ajoutée ou mise à jour dans l'entrée existante:",
        existingTableReservation,
      );

      // Gestion du résultat avec ou sans callback
      if (typeof callback === "function") {
        return callback(null, existingTableReservation);
      } else {
        return existingTableReservation;
      }
    } else {
      // Si aucune entrée n'existe, créer une nouvelle entrée avec la table et réservation
      const newTableReservation = new TableReservation({
        date: tableReservationData.date,
        restaurant_id: tableReservationData.restaurant_id,
        tables: [
          {
            table_id: tableReservationData.table_id,
            reservations: [
              {
                reservation_id: tableReservationData.reservation_id,
                status: tableReservationData.status || "waiting",
                occupied_start: tableReservationData.occupied_start,
                occupied_end: tableReservationData.occupied_end,
              },
            ],
          },
        ],
      });

      await newTableReservation.save();
      console.log(
        "Nouvelle TableReservation ajoutée avec succès:",
        newTableReservation,
      );

      // Gestion du résultat avec ou sans callback
      if (typeof callback === "function") {
        return callback(null, newTableReservation);
      } else {
        return newTableReservation;
      }
    }
  } catch (error) {
    console.error("Erreur dans addOneTableReservation:", error);
    if (typeof callback === "function") {
      if (error instanceof APIError) {
        return callback(error);
      }
      return callback({
        message: "Erreur lors de la gestion de la réservation de table.",
        type_error: "unknown_error",
        error: error.message || String(error),
      });
    } else {
      // Si pas de callback, propager l'erreur
      throw error;
    }
  }
};

// Rechercher une entrée TableReservation par date et restaurant_id
module.exports.findTableReservationByDate = async function (
  date,
  restaurant_id,
) {
  try {
    console.log("=== Début de findTableReservationByDate ===");
    console.log(
      "Paramètres reçus - Date:",
      date,
      "Restaurant ID:",
      restaurant_id,
    );

    const searchDate = moment.utc(date).startOf("day").toDate();
    console.log("Date normalisée pour la recherche:", searchDate);

    if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
      throw new APIError(
        "L'ID du restaurant n'est pas valide",
        400,
        "invalid_restaurant_id",
      );
    }

    const restaurantObjectId = new mongoose.Types.ObjectId(restaurant_id);
    const tableReservation = await TableReservation.findOne({
      date: searchDate,
      restaurant_id: restaurantObjectId,
    });

    if (!tableReservation) {
      throw new APIError(
        "Aucune réservation trouvée pour cette date et ce restaurant",
        404,
        "no_reservation_found",
      );
    }

    return {
      message: "Réservations trouvées",
      data: tableReservation,
    };
  } catch (error) {
    console.error("Erreur lors de la recherche dans TableReservation:", error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Erreur lors de la recherche des réservations",
      500,
      "table_reservation_error",
      { originalError: error.message },
    );
  }
};
