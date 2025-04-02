const ReservationSchema = require("../schemas/Reservation");
const TableReservation = require("../schemas/TableReservation"); // Assurez-vous d'importer le modèle TableReservation
const Table = require("../schemas/Table");
const TablePlan = require("../schemas/TablePlan");
const { findOneTablePlan } = require("./TablePlanService");
const _ = require("lodash");
const async = require("async");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const cron = require("../utils/cron");
const { findTablePlanWithoutRestaurantId } = require("./TablePlanService"); // Assurez-vous d'importer la nouvelle fonction
const { addOneTableReservation } = require("./TableReservationService");
const { APIError } = require("../middlewares/errorHandler");

const Reservation =
  mongoose.models.Reservation ||
  mongoose.model("Reservation", ReservationSchema);

// Fonction pour créer une réservation
module.exports.addOneReservation = async function (reservationData, callback) {
  try {
    console.log("=== Début de la fonction addOneReservation ===");
    console.log("Données de réservation reçues:", reservationData);

    const selectedDate = moment
      .utc(reservationData.date_selected)
      .startOf("day")
      .toDate();
    const startTime = moment(
      `${reservationData.date_selected} ${reservationData.time_selected}`,
      "YYYY-MM-DD HH:mm",
    ).toDate();
    const endTime = moment(startTime).add(1, "hour").toDate();

    console.log("Date sélectionnée (normalisée):", selectedDate);
    console.log("Heure de début (occupied_start):", startTime);
    console.log("Heure de fin (occupied_end):", endTime);

    // Rechercher le dernier plan de table créé dans la collection TablePlan
    const tablePlan = await TablePlan.findOne({
      restaurant_id: reservationData.restaurant_id,
    }).sort({ _id: -1 });

    if (!tablePlan) {
      throw new APIError(
        "Pas de plan de table trouvé pour ce restaurant.",
        404,
        "no_table_plan",
      );
    }

    // Filtrer les tables compatibles en fonction du nombre de personnes
    const compatibleTables = tablePlan.tables.filter((table) => {
      if (
        (reservationData.nbr_persons === 1 ||
          reservationData.nbr_persons === 2) &&
        table.capacity === 2
      ) {
        return true;
      } else if (
        (reservationData.nbr_persons === 3 ||
          reservationData.nbr_persons === 4) &&
        table.capacity === 4
      ) {
        return true;
      } else if (
        (reservationData.nbr_persons === 5 ||
          reservationData.nbr_persons === 6) &&
        table.capacity === 6
      ) {
        return true;
      } else if (
        (reservationData.nbr_persons === 7 ||
          reservationData.nbr_persons === 8) &&
        table.capacity === 8
      ) {
        return true;
      }
      return false;
    });

    if (compatibleTables.length === 0) {
      throw new APIError(
        "Aucune table compatible pour le nombre de personnes spécifié.",
        400,
        "no_compatible_table",
      );
    }

    // Mélanger les tables compatibles de manière aléatoire en utilisant Lodash
    const shuffledCompatibleTables = _.shuffle(compatibleTables);

    // Séparer les tables en utilisées et non utilisées
    const tableReservations = await TableReservation.find({
      date: selectedDate,
      restaurant_id: tablePlan.restaurant_id,
    });

    // Obtenir les IDs des tables déjà utilisées
    const usedTableIds = tableReservations.flatMap((tr) =>
      tr.tables.map((t) => t.table_id.toString()),
    );

    // Séparer les tables non utilisées et utilisées
    const unusedTables = shuffledCompatibleTables.filter(
      (table) => !usedTableIds.includes(table.table_id.toString()),
    );
    const usedTables = shuffledCompatibleTables.filter((table) =>
      usedTableIds.includes(table.table_id.toString()),
    );

    let availableTable = null;

    // Fonction pour vérifier la disponibilité d'une table
    const isTableAvailable = async (table) => {
      const tableReservation = await TableReservation.findOne({
        date: selectedDate,
        "tables.table_id": table.table_id,
      });

      if (!tableReservation) {
        return true;
      }

      const tableData = tableReservation.tables.find((t) =>
        t.table_id.equals(table.table_id),
      );
      const reservations = tableData ? tableData.reservations : [];

      return !reservations.some(
        (reservation) =>
          startTime < reservation.occupied_end &&
          endTime > reservation.occupied_start,
      );
    };

    // Tenter d'assigner une table non utilisée
    for (const table of unusedTables) {
      console.log(
        `Vérification de la disponibilité pour la table ${table.number} (non utilisée)`,
      );

      const available = await isTableAvailable(table);
      if (available) {
        availableTable = table;
        console.log(
          "Table disponible trouvée (non utilisée):",
          availableTable.number,
        );
        break;
      } else {
        console.log(
          `Conflit détecté sur la table ${table.number} pour le créneau ${reservationData.time_selected}`,
        );
      }
    }

    // Si aucune table non utilisée n'est disponible, essayer les tables utilisées
    if (!availableTable) {
      console.log(
        "Aucune table non utilisée disponible, tentative avec les tables utilisées.",
      );
      for (const table of usedTables) {
        console.log(
          `Vérification de la disponibilité pour la table ${table.number} (utilisée)`,
        );

        const available = await isTableAvailable(table);
        if (available) {
          availableTable = table;
          console.log(
            "Table disponible trouvée (utilisée):",
            availableTable.number,
          );
          break;
        } else {
          console.log(
            `Conflit détecté sur la table ${table.number} pour le créneau ${reservationData.time_selected}`,
          );
        }
      }
    }

    if (!availableTable) {
      throw new APIError(
        "Aucune table disponible pour le créneau sélectionné.",
        409,
        "no_available_table",
      );
    }

    // Créer la réservation
    reservationData.table_id = availableTable.table_id;
    reservationData.table_number = availableTable.number;
    reservationData.date_selected = selectedDate;
    reservationData.restaurant_id = tablePlan.restaurant_id;

    const newReservation = new Reservation(reservationData);
    await newReservation.save();
    console.log("Réservation créée avec succès:", newReservation);

    // Ajouter ou mettre à jour la réservation dans TableReservation
    const tableReservationData = {
      date: selectedDate,
      table_id: availableTable.table_id,
      reservation_id: newReservation._id,
      occupied_start: startTime,
      occupied_end: endTime,
      status: "waiting",
      restaurant_id: tablePlan.restaurant_id,
    };

    console.log("Données pour la TableReservation:", tableReservationData);

    // Appeler la fonction pour ajouter la réservation dans TableReservation
    // Vérification si callback est une fonction
    if (typeof callback === "function") {
      try {
        const tableReservationResult =
          await addOneTableReservation(tableReservationData);
        return callback(null, newReservation);
      } catch (error) {
        return callback(error);
      }
    } else {
      // Si pas de callback, utiliser la promesse directement
      await addOneTableReservation(tableReservationData);
      return newReservation;
    }
  } catch (error) {
    console.error("Erreur dans addOneReservation:", error);
    if (typeof callback === "function") {
      return callback({
        message: "Erreur lors de la création de la réservation.",
        type_error: "unknown_error",
        error: error.message || String(error),
      });
    } else {
      // Si pas de callback, propager l'erreur
      throw error;
    }
  }
};

/// Fonction pour confirmer une réservation
module.exports.confirmReservation = async function (reservationId, callback) {
  try {
    // Récupérer la réservation par son ID
    const reservation = await Reservation.findById(reservationId);

    if (!reservation || reservation.status !== "waiting") {
      throw new APIError(
        reservation
          ? "Seules les réservations en attente peuvent être confirmées."
          : "Réservation non trouvée.",
        404,
        reservation ? "invalid_status" : "not_found",
      );
    }

    // Confirmer la réservation
    reservation.status = "confirmed";
    await reservation.save();

    // Mettre à jour la réservation dans TableReservation
    const updatedTableReservation = await TableReservation.findOneAndUpdate(
      {
        date: reservation.date_selected,
        "tables.table_id": reservation.table_id,
        "tables.reservations.reservation_id": reservation._id, // Rechercher la bonne réservation
      },
      {
        $set: {
          "tables.$[table].reservations.$[res].status": "confirmed", // Mettre à jour le statut dans le sous-document reservations
        },
      },
      {
        arrayFilters: [
          { "table.table_id": reservation.table_id },
          { "res.reservation_id": reservation._id },
        ], // Filtre pour la bonne table et la bonne réservation
        new: true, // Retourner le document mis à jour
      },
    );

    // Si aucun plan de réservation de table n'est trouvé, renvoyer une erreur
    if (!updatedTableReservation) {
      throw new APIError(
        "TableReservation non trouvée pour la réservation.",
        404,
        "no_table_reservation",
      );
    }

    // Renvoyer la réservation confirmée
    callback(null, reservation);
  } catch (error) {
    callback({
      message: "Erreur lors de la confirmation de la réservation.",
      type_error: "unknown_error",
      error: error.message || String(error),
    });
  }
};

// Fonction pour annuler une réservation
module.exports.cancelReservation = async function (reservationId, callback) {
  try {
    // Récupérer la réservation par son ID
    const reservation = await Reservation.findById(reservationId);
    if (!reservation || reservation.status === "canceled") {
      throw new APIError(
        "Réservation non trouvée ou déjà annulée.",
        404,
        "not_found",
      );
    }

    // Mettre à jour le statut de la réservation à "canceled"
    reservation.status = "canceled";
    await reservation.save();

    // Mettre à jour le statut de la réservation dans TableReservation
    const updatedTableReservation = await TableReservation.findOneAndUpdate(
      {
        date: reservation.date_selected,
        "tables.table_id": reservation.table_id,
        "tables.reservations.reservation_id": reservation._id, // Rechercher la bonne réservation
      },
      {
        $set: {
          "tables.$[table].reservations.$[res].status": "canceled", // Mettre à jour le statut dans le sous-document reservations
        },
      },
      {
        arrayFilters: [
          { "table.table_id": reservation.table_id },
          { "res.reservation_id": reservation._id },
        ], // Filtre pour la bonne table et la bonne réservation
        new: true, // Retourner le document mis à jour
      },
    );

    if (!updatedTableReservation) {
      throw new APIError(
        "Plan de table non trouvé pour cette réservation.",
        404,
        "not_found",
      );
    }

    // Renvoyer la réservation annulée
    callback(null, reservation);
  } catch (error) {
    // Gestion des erreurs
    callback({
      message: "Erreur lors de l'annulation de la réservation.",
      type_error: "unknown_error",
      error: error.message || String(error),
    });
  }
};

// Rechercher les réservations par date et restaurant_id
module.exports.findReservationsByDate = async function (
  date,
  restaurantId,
  callback,
) {
  const normalizedDate = moment.utc(date).startOf("day").toDate();
  const query = {
    date_selected: normalizedDate,
    restaurant_id: restaurantId,
  };
  const reservations = await Reservation.find(query)
    .populate("user_id")
    .populate({
      path: "table",
      select: "number capacity shape", // Sélectionner les champs nécessaires
    });

  callback(null, reservations);
};

// Rechercher les réservations par ID utilisateur
module.exports.findReservationsByUserId = async function (userId, callback) {
  const reservations = await Reservation.find({ user_id: userId })
    .populate("user_id")
    .populate({
      path: "table",
      select: "number capacity shape", // Sélectionner les champs nécessaires
    });

  callback(null, reservations);
};

// Fonction pour récupérer toutes les réservations et compter par statut
module.exports.findAllReservations = async function (callback) {
  try {
    // Récupération de toutes les réservations avec les détails nécessaires
    const reservations = await Reservation.find({})
      .populate("user_id")
      .populate({
        path: "table",
        select: "table_number table_size shape",
      });

    // Comptabilisation des réservations par statut
    const statusCounts = await Reservation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Formatage des résultats de comptabilisation
    const formattedStatusCounts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Inclure les comptages dans le résultat
    callback(null, { reservations, statusCounts: formattedStatusCounts });
  } catch (error) {
    callback(error, null);
  }
};

// Filtrer les tables disponibles en fonction du nombre de personnes
const filterAvailableTables = (tables, nbrPersons) => {
  // Arrondir à la paire précédente si impair
  const adjustedNbrPersons = nbrPersons % 2 !== 0 ? nbrPersons - 1 : nbrPersons;
  const isModulo = nbrPersons % 2 === 0; // Détecter si le nombre est pair ou impair

  // Filtrer les tables en fonction de la capacité et du nombre de personnes ajusté
  return tables.filter((table) => {
    const { capacity } = table;

    // Appliquer les règles selon que le nombre est pair ou impair
    return isModulo
      ? capacity >= adjustedNbrPersons && capacity <= nbrPersons // Cas des nombres pairs
      : capacity >= nbrPersons && capacity <= nbrPersons; // Cas des nombres impairs
  });
};

// Fonction pour vérifier la disponibilité
module.exports.checkAvailability = async function (
  restaurant_id,
  date_selected,
  time_selected,
  nbr_persons,
  callback,
) {
  try {
    console.log("=== Vérification de la disponibilité ===");
    const selectedDate = moment.utc(date_selected).startOf("day").toDate();
    const startTime = moment(
      `${date_selected} ${time_selected}`,
      "YYYY-MM-DD HH:mm",
    ).toDate();
    const endTime = moment(startTime).add(1, "hour").toDate();

    // Rechercher le dernier plan de table
    const tablePlan = await TablePlan.findOne({
      restaurant_id: restaurant_id,
    }).sort({ _id: -1 });
    if (!tablePlan) {
      throw new APIError("Pas de plan de table trouvé.", 404, "no_table_plan");
    }

    // Filtrer les tables compatibles
    const compatibleTables = tablePlan.tables.filter((table) => {
      if ((nbr_persons === 1 || nbr_persons === 2) && table.capacity === 2)
        return true;
      if ((nbr_persons === 3 || nbr_persons === 4) && table.capacity === 4)
        return true;
      if ((nbr_persons === 5 || nbr_persons === 6) && table.capacity === 6)
        return true;
      if ((nbr_persons === 7 || nbr_persons === 8) && table.capacity === 8)
        return true;
      return false;
    });

    if (compatibleTables.length === 0) {
      return callback(null, false);
    }

    // Vérifier les réservations existantes
    const tableReservations = await TableReservation.find({
      date: selectedDate,
      restaurant_id: restaurant_id,
    });

    // Vérifier la disponibilité de chaque table
    for (const table of compatibleTables) {
      const tableReservation = tableReservations.find((tr) =>
        tr.tables.some((t) => t.table_id.equals(table.table_id)),
      );

      if (!tableReservation) {
        return callback(null, true); // Table disponible
      }

      const tableData = tableReservation.tables.find((t) =>
        t.table_id.equals(table.table_id),
      );
      const reservations = tableData ? tableData.reservations : [];

      const isAvailable = !reservations.some(
        (reservation) =>
          startTime < reservation.occupied_end &&
          endTime > reservation.occupied_start,
      );

      if (isAvailable) {
        return callback(null, true); // Table disponible
      }
    }

    return callback(null, false); // Aucune table disponible
  } catch (error) {
    console.error("Erreur dans checkAvailability:", error);
    return callback({
      message: "Erreur lors de la vérification de la disponibilité.",
      type_error: "unknown_error",
      error: error.message || String(error),
    });
  }
};
