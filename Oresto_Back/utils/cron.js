const cron = require('node-cron');
const generateTablePlansForAllRestaurants = require('../services/TablePlanService'); // Assurez-vous que le chemin est correct
const archiveReservations = require ('../services/ReservationService')

// Planifier la génération des plans de table tous les jours à minuit pour toutes les entreprises
cron.schedule('0 0 * * *', () => {
    generateTablePlansForAllRestaurants();
    console.log("Tâche cron exécutée : génération des plans de table pour les 30 prochains jours pour toutes les entreprises.");
});

// Configurer le cron job pour exécuter la fonction d'archivage tous les jours à 01:00
cron.schedule('0 1 * * *', () => {
    reservationService.archiveReservations((err, result) => {
        if (err) {
            console.error("Error during scheduled archiving:", err);
        } else {
            console.log("Scheduled archiving result:", result);
        }
    });
});