const TablePlan = require('../schemas/TablePlan');
const Table = require('../schemas/Table');
const moment = require('moment');

// Fonction pour modifier ou créer un plan de table
module.exports.updateOneTablePlan = async function(restaurantId, date) {
    try {
        // Normaliser la date en début de journée UTC
        const normalizedDate = moment.utc(date).startOf('day').toDate();

        // Récupérer toutes les tables actives (non archivées) du restaurant
        const activeTables = await Table.find({
            restaurant_id: restaurantId,
            status: { $ne: 'archived' } // Exclure les tables archivées
        });

        // Rechercher un plan de table existant pour la date donnée
        let tablePlan = await TablePlan.findOne({
            restaurant_id: restaurantId,
            date: normalizedDate
        });

        if (!tablePlan) {
            // Si aucun plan de table n'existe, en créer un nouveau avec toutes les informations de la table
            tablePlan = new TablePlan({
                restaurant_id: restaurantId,
                date: normalizedDate,
                tables: activeTables.map(table => ({
                    table_id: table._id,
                    number: table.number,
                    capacity: table.capacity,
                    shape: table.shape,
                    position_x: table.position_x,
                    position_y: table.position_y,
                    rotate: table.rotate  // Conserver l'information de rotation
                }))
            });
        } else {
            // Si le plan existe, mettre à jour uniquement les tables actives et conserver les autres attributs
            const updatedTables = activeTables.map(table => {
                // Trouver la table existante dans le plan si elle existe
                const existingTable = tablePlan.tables.find(t => t.table_id.equals(table._id));
                return {
                    table_id: table._id,
                    number: table.number,
                    capacity: table.capacity,
                    shape: table.shape,
                    position_x: table.position_x,
                    position_y: table.position_y,
                    rotate: existingTable ? existingTable.rotate : table.rotate // Conserver la rotation existante
                };
            });

            // Mettre à jour le plan de table avec les nouvelles informations
            tablePlan.tables = updatedTables;
        }

        // Sauvegarder le plan de table mis à jour ou créé
        await tablePlan.save();

        return tablePlan;
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour ou de la création du plan de table: ' + error.message);
    }
};




// Recherche d'un plan de table pour une date spécifique
module.exports.findOneTablePlan = async function({ restaurantId, date }) {
    try {
        const startOfDay = moment.utc(date).startOf('day').toDate();
        const endOfDay = moment.utc(date).endOf('day').toDate();

        // Rechercher le plan de table pour la date donnée
        let tablePlan = await TablePlan.findOne({
            restaurant_id: restaurantId,
            date: { $gte: startOfDay, $lt: endOfDay }
        }).populate('tables.table_id');

        // Si aucun plan de table n'est trouvé pour la date donnée
        if (!tablePlan) {
            // Rechercher le premier plan de table (le plus ancien)
            const firstTablePlan = await TablePlan.findOne({ restaurant_id: restaurantId })
                                                  .sort({ date: 1 }) // Trier par date croissante pour obtenir le plus ancien plan
                                                  .populate('tables.table_id');

            // Rechercher le dernier plan de table (le plus récent)
            const lastTablePlan = await TablePlan.findOne({ restaurant_id: restaurantId })
                                                 .sort({ date: -1 }) // Trier par date décroissante pour obtenir le plus récent plan
                                                 .populate('tables.table_id');

            // Si la date recherchée est antérieure au premier plan de table, retourner le premier plan
            if (firstTablePlan && date < firstTablePlan.date) {
                return firstTablePlan;
            }

            // Si la date recherchée est postérieure au dernier plan de table, retourner le dernier plan
            if (lastTablePlan && date > lastTablePlan.date) {
                return lastTablePlan;
            }

            // Si aucun plan de table n'est trouvé, lancer une exception
            if (!firstTablePlan && !lastTablePlan) {
                throw new Error('Aucun plan de table trouvé.');
            }
        }

        return tablePlan;
    } catch (error) {
        throw new Error('Erreur lors de la récupération du plan de table : ' + error.message);
    }
};


// Rechercher le dernier plan de table disponible
module.exports.findLastTablePlan = async function(restaurantId) {
    try {
        const tablePlan = await TablePlan.findOne({ restaurant_id: restaurantId })
                            .sort({ date: -1 }) // Trier par date décroissante pour obtenir le dernier plan
                            .populate('tables.table_id');
        return tablePlan;
    } catch (error) {
        throw new Error('Erreur lors de la récupération du dernier plan de table : ' + error.message);
    }
};

// Mettre à jour ou ajouter un plan de table pour une date spécifique
module.exports.updateOrAddOneTablePlan = async function(restaurantId, date) {
    try {
        const normalizedDate = moment.utc(date).startOf('day').toDate();
        let tablePlan = await TablePlan.findOne({ date: normalizedDate, restaurant_id: restaurantId });

        if (!tablePlan) {
            tablePlan = await module.exports.addOneTablePlan(restaurantId, normalizedDate);
        } else {
            const tables = await Table.find({ restaurant_id: restaurantId });
            tablePlan.tables = tables.map(table => ({
                table_id: table._id,
                number: table.number,
                capacity: table.capacity,
                shape: table.shape,
                position_x: table.position_x,
                position_y: table.position_y,
            }));
            await tablePlan.save();
        }

        return tablePlan;
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour ou de l’ajout du plan de table : ' + error.message);
    }
};


// Recherche un plan de table pour une date spécifique sans restaurant_id
module.exports.findTablePlanWithoutRestaurantId = async function (selectedDate) {
    try {
        console.log("Recherche du plan de table pour la date :", selectedDate);
        
        // Requête pour récupérer le dernier plan de table pour une date donnée ou avant cette date
        const tablePlan = await TablePlan.findOne({
            date: { $lte: selectedDate }
        })
        .sort({ date: -1 })  // Trier par date décroissante
        .limit(1);  // Récupérer le dernier plan de table

        if (!tablePlan) {
            console.log("Aucun plan de table trouvé pour la date :", selectedDate);
            throw new Error("Aucun plan de table trouvé.");
        }

        console.log("Plan de table trouvé :", tablePlan);
        return tablePlan;
    } catch (error) {
        console.error("Erreur attrapée dans findTablePlanWithoutRestaurantId:", error);
        throw error;
    }
};
