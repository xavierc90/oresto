const TablePlanService = require('../services/TablePlanService');
const moment = require('moment');

// Contrôleur pour mettre à jour ou ajouter le plan de table pour aujourd'hui
module.exports.updateOrAddOneTablePlan = async function(req, res) {
    try {
        const restaurantId = req.user.restaurant[0];
        if (!restaurantId) {
            return res.status(400).send({ msg: 'Le restaurant_id est requis.' });
        }

        const tablePlan = await TablePlanService.updateOrAddOneTablePlan(restaurantId);
        res.status(200).send(tablePlan);
    } catch (error) {
        console.error("Erreur lors de la mise à jour ou de l'ajout du plan de table:", error.message);
        res.status(500).send({ msg: 'Erreur interne du serveur.' });
    }
};

// Contrôleur pour récupérer un plan de table par date et restaurant_id
module.exports.findOneTablePlan = async function(req, res) {
    try {
        const restaurantId = req.query.restaurant_id; // Récupérer le restaurant_id à partir des paramètres de requête
        const date = req.params.date; // Récupérer la date à partir des paramètres de l'URL

        // Valider l'existence du restaurant_id
        if (!restaurantId) {
            return res.status(400).send({ msg: 'Le restaurant_id est requis.' });
        }

        // Valider le format de la date et la convertir en objet Date
        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).send({ msg: 'Format de date invalide. Utilisez le format YYYY-MM-DD.' });
        }

        const normalizedDate = moment(date, 'YYYY-MM-DD').startOf('day').toDate();

        // Appeler le service pour trouver le plan de table
        let tablePlan = await TablePlanService.findOneTablePlan({ restaurantId, date: normalizedDate });

        // Si aucun plan de table n'est trouvé pour la date donnée, récupérer le dernier plan de table
        if (!tablePlan) {
            tablePlan = await TablePlanService.findLastTablePlan(restaurantId);
            if (!tablePlan) {
                return res.status(404).send({ msg: 'Aucun plan de table trouvé.' });
            }
        }

        // Envoyer le plan de table trouvé ou le dernier plan
        res.status(200).send(tablePlan);
    } catch (error) {
        console.error("Erreur lors de la récupération du plan de table:", error.message);
        res.status(500).send({ msg: 'Erreur interne du serveur.' });
    }
};

// Contrôleur pour récupérer tous les plans de table
module.exports.findManyTablePlans = async function(req, res) {
    try {
        const restaurantId = req.user.restaurant[0];
        if (!restaurantId) {
            return res.status(400).send({ msg: 'Le restaurant_id est requis.' });
        }

        const tablePlans = await TablePlanService.findManyTablePlans(restaurantId);
        res.status(200).send(tablePlans);
    } catch (error) {
        console.error("Erreur lors de la récupération des plans de table:", error.message);
        res.status(500).send({ msg: 'Erreur interne du serveur.' });
    }
};
