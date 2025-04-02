const OpeningHours = require("../schemas/OpeningHour");
const moment = require("moment");
const { APIError } = require("../middlewares/errorHandler");

// Ajouter les plages horaires par défaut pour un restaurant
module.exports.addOpeningHours = async function (restaurant_id, user_id) {
  try {
    const defaultHours = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      hours: [
        {
          period: "afternoon",
          opening: "12:00",
          closing: "14:00",
          status: "opened",
        },
        {
          period: "evening",
          opening: "20:00",
          closing: "23:00",
          status: "opened",
        },
      ],
    }));

    await Promise.all(
      defaultHours.map((openingHour) =>
        OpeningHours.create({
          restaurant_id,
          created_by: user_id,
          day: openingHour.day,
          hours: openingHour.hours,
        }),
      ),
    );

    console.log(
      "Plages horaires par défaut créées pour le restaurant:",
      restaurant_id,
    );
  } catch (error) {
    console.error(
      "Erreur lors de la création des plages horaires par défaut:",
      error,
    );
    throw new APIError(
      "Erreur lors de la création des plages horaires par défaut",
      500,
      "opening_hours_creation_error",
      { originalError: error.message },
    );
  }
};

// Trouver les horaires d'ouverture pour un restaurant (par restaurantId)
module.exports.findOpeningHoursByRestaurantId = async function (restaurantId) {
  try {
    const openingHours = await OpeningHours.find({
      restaurant_id: restaurantId,
    });

    if (!openingHours || openingHours.length === 0) {
      throw new APIError(
        `Aucun horaire trouvé pour le restaurant avec l'ID ${restaurantId}`,
        404,
        "no_opening_hours_found",
      );
    }

    return openingHours;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires d'ouverture:",
      error,
    );
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Erreur lors de la récupération des horaires d'ouverture",
      500,
      "opening_hours_error",
      { originalError: error.message },
    );
  }
};

// Modifier les horaires d'ouverture pour tous les jours associés à une société
module.exports.updateOpeningHoursByRestaurantId = async function (
  restaurantId,
  updatedHours,
) {
  try {
    const openingDays = await OpeningHours.find({
      restaurant_id: restaurantId,
    });

    if (openingDays.length === 0) {
      throw new APIError(
        `Aucun jour d'ouverture trouvé pour le restaurant avec l'ID ${restaurantId}`,
        404,
        "no_opening_days_found",
      );
    }

    const updatePromises = openingDays.map(async (openingDay) => {
      const newHours = updatedHours.find((hour) => hour.day === openingDay.day);
      if (newHours) {
        openingDay.hours = newHours.hours;
        await openingDay.save();
      }
    });

    await Promise.all(updatePromises);
    return await OpeningHours.find({ restaurant_id: restaurantId });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des plages horaires :", error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Erreur lors de la mise à jour des plages horaires",
      500,
      "opening_hours_update_error",
      { originalError: error.message },
    );
  }
};

// Générer des créneaux horaires tous les quarts d'heure
module.exports.generateTimeSlots = async function (restaurantId) {
  try {
    // Récupérer tous les horaires d'ouverture pour le restaurant
    const openingHours = await OpeningHours.find({
      restaurant_id: restaurantId,
    });

    if (!openingHours || openingHours.length === 0) {
      throw new APIError(
        `Aucun horaire trouvé pour le restaurant avec l'ID ${restaurantId}`,
        404,
        "no_opening_hours_found",
      );
    }

    // Trier les jours d'ouverture selon l'ordre défini
    const sortedOpeningHours = openingHours.sort((a, b) => {
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });

    // Itérer sur chaque jour d'ouverture
    const timeSlots = {};
    for (const openingDay of sortedOpeningHours) {
      const slotsByPeriod = { afternoon: [], evening: [] }; // Créer un objet pour stocker les créneaux par période

      // Itérer sur chaque plage horaire de la journée
      for (const hour of openingDay.hours) {
        if (hour.status === "closed") {
          continue; // Si la plage horaire est fermée, on la saute
        }

        const openingTime = moment(hour.opening, "HH:mm");
        const closingTime = moment(hour.closing, "HH:mm");

        // Générer des créneaux horaires tous les quarts d'heure entre `opening` et `closing`
        while (openingTime.isBefore(closingTime)) {
          slotsByPeriod[hour.period].push(openingTime.format("HH:mm")); // Stocker dans la période appropriée
          openingTime.add(15, "minutes");
        }
      }

      // Ajouter les créneaux horaires pour le jour correspondant
      timeSlots[openingDay.day] = slotsByPeriod;
    }

    // Retourner les créneaux générés pour chaque jour et chaque période
    return timeSlots;
  } catch (error) {
    console.error("Erreur lors de la génération des créneaux horaires:", error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Erreur lors de la génération des créneaux horaires",
      500,
      "time_slots_generation_error",
      { originalError: error.message },
    );
  }
};
