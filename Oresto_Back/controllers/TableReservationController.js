const TableReservationService = require('../services/TableReservationService'); // Assurez-vous que le chemin est correct
const jwt = require('jsonwebtoken');
const config = require('../config'); // Assurez-vous que le chemin est correct

module.exports.addOneTableReservation = async (req, res) => {
    try {
        // Les données de réservation sont récupérées depuis le corps de la requête
        const tableReservationData = {
            date: req.body.date,
            restaurant_id: req.body.restaurant_id,
            table_id: req.body.table_id,
            reservation_id: req.body.reservation_id,
            occupied_start: req.body.occupied_start,
            occupied_end: req.body.occupied_end,
            status: req.body.status
        };

        // Appeler la fonction de service pour ajouter ou mettre à jour une réservation de table
        TableReservationService.addOneTableReservation(tableReservationData, (error, result) => {
            if (error) {
                // Gérer les erreurs et retourner une réponse appropriée
                if (error.type_error === "conflicting_reservation") {
                    return res.status(409).json({
                        message: error.message
                    });
                }

                return res.status(500).json({
                    message: "Erreur lors de l'ajout de la réservation",
                    error: error.error
                });
            }

            // Retourner le résultat en cas de succès
            return res.status(200).json({
                message: "Réservation ajoutée avec succès",
                data: result
            });
        });

    } catch (err) {
        // Gérer toute autre erreur inattendue
        console.error("Erreur dans le contrôleur addOneTableReservation:", err);
        return res.status(500).json({
            message: "Erreur interne du serveur",
            error: err.message
        });
    }
};

// Contrôleur pour rechercher les réservations de table par date
module.exports.getTableReservationsByDate = async function (req, res) {
    try {
        const user = req.user; // Supposons que l'utilisateur est extrait du token
        console.log("Utilisateur authentifié:", user);

        // Vérifiez que l'utilisateur a un restaurant associé
        if (!user.restaurant_id) {
            return res.status(400).send({
                message: "L'utilisateur n'a pas de restaurant associé.",
                type_error: "no_restaurant"
            });
        }

        // Récupération de la date à partir des paramètres de l'URL
        const date = req.params.date; // Par exemple: "/table_reservations/:date"
        const restaurant_id = user.restaurant_id; // Utilisation du restaurant_id de l'utilisateur

        console.log("Recherche des réservations de table pour la date:", date, "et le restaurant ID:", restaurant_id);

        // Appel du service pour rechercher les réservations de table par date et restaurant_id
        const result = await TableReservationService.findTableReservationByDate(date, restaurant_id);

        if (result.data) {
            return res.status(200).send(result.data);
        } else {
            return res.status(404).send(result);
        }
    } catch (error) {
        console.error("Erreur dans getTableReservationsByDate:", error);
        return res.status(500).send({
            message: "Erreur lors de la récupération des réservations de table.",
            error: error.message || String(error)
        });
    }
};
