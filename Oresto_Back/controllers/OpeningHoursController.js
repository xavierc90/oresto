const OpeningHours = require('../schemas/OpeningHour');  // Assurez-vous que le chemin est correct
const OpeningHoursService = require('../services/OpeningHoursService');
const moment = require('moment');

// Créer des horaires d'ouverture pour un jour de la semaine
module.exports.createOpeningHours = function (req, res) {
    const user = req.user;  // Supposons que req.user contient les informations de l'utilisateur connecté
    const openingHourData = req.body;  // Récupère les données du body de la requête

    OpeningHoursService.addOneOpeningHour(openingHourData, user, (err, result) => {
        if (err) {
            return res.status(400).json({ message: err.message, error_type: err.type_error });
        }
        res.status(201).json({ message: "Horaires d'ouverture ajoutés avec succès.", data: result });
    });
};

// Rechercher les horaires d'ouverture pour un restaurant
module.exports.findOpeningHours = async function (req, res) {
    const { restaurantId } = req.params;  // Récupérer correctement l'ID du restaurant

    if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required." });
    }

    try {
        const openingHours = await OpeningHoursService.findOpeningHoursByRestaurantId(restaurantId);
        res.status(200).json(openingHours);
    } catch (err) {
        res.status(400).json({ message: err.message, error_type: "no_opening_hours_found" });
    }
};

// Mettre à jour les horaires d'ouverture pour une société spécifique
module.exports.updateOpeningHours = async function (req, res) {
    const { restaurantId } = req.params;  // Récupérer l'ID de la société depuis l'URL
    const updatedHours = req.body;  // Les nouvelles heures seront dans le body de la requête

    console.log('ID de la société:', restaurantId);
    console.log('Heures mises à jour:', updatedHours);

    try {
        // Appel au service pour mettre à jour les horaires
        const updatedOpeningDays = await OpeningHoursService.updateOpeningHoursByRestaurantId(restaurantId, updatedHours);
        
        // Réponse avec les horaires mis à jour
        res.status(200).json({ message: "Les plages horaires ont été mises à jour avec succès.", data: updatedOpeningDays });
    } catch (err) {
        // En cas d'erreur, loggez l'erreur et renvoyez une réponse avec le message d'erreur
        console.error('Erreur lors de la mise à jour des horaires :', err.message);
        res.status(400).json({ message: err.message, error_type: "update_failed" });
    }
};

// Générer les créneaux horaires (timeslots)
module.exports.generateTimeSlots = async function (req, res) {
    const { restaurantId } = req.params;
    console.log("Restaurant ID reçu:", restaurantId);

    try {
        // Récupérer les plages horaires du restaurant
        const openingHours = await OpeningHours.find({ restaurant_id: restaurantId });
        console.log("Horaires d'ouverture récupérés:", openingHours);

        if (!openingHours || openingHours.length === 0) {
            console.log("Aucun horaire trouvé pour le restaurant.");
            return res.status(404).json({ message: `Aucun horaire trouvé pour le restaurant avec l'ID ${restaurantId}.` });
        }

        // Objet pour stocker les créneaux horaires par jour et par période (afternoon/evening)
        const timeSlotsByDay = {};

        // Boucle à travers chaque jour et ses heures
        openingHours.forEach((day) => {
            const slotsByPeriod = { afternoon: [], evening: [] };
            
            day.hours.forEach((hourSlot) => {
                if (hourSlot.status === 'opened') {
                    console.log(`Génération des créneaux pour ${day.day}, période ${hourSlot.period}, de ${hourSlot.opening} à ${hourSlot.closing}`);

                    // Générer des créneaux horaires de 15 minutes
                    let startTime = moment(hourSlot.opening, 'HH:mm');
                    const endTime = moment(hourSlot.closing, 'HH:mm');

                    while (startTime.isBefore(endTime)) {
                        slotsByPeriod[hourSlot.period].push(startTime.format('HH:mm'));
                        startTime = startTime.add(15, 'minutes');
                    }
                }
            });

            // Ajouter les créneaux horaires par période au tableau de créneaux
            timeSlotsByDay[day.day] = slotsByPeriod;
        });

        console.log("Créneaux horaires générés:", timeSlotsByDay);

        // Retourner les créneaux horaires générés
        res.status(200).json(timeSlotsByDay);
    } catch (error) {
        console.error('Erreur lors de la génération des créneaux horaires:', error);
        res.status(500).json({ message: 'Erreur lors de la génération des créneaux horaires.' });
    }
};
