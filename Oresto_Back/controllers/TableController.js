const TableService = require("../services/TableService");
const logger = require("../utils/logger").http;
const mongoose = require("mongoose"); // Import de mongooses

// La fonction permet d'ajouter une table.
module.exports.addOneTable = function (req, res) {
  req.log.info("Création d'une table");

  if (req.user.role !== "manager") {
    return res.status(403).send({
      msg: "Vous n'êtes pas autorisé à créer une table.",
      type_error: "not-authorized",
    });
  }

  var options = { user: req.user };

  TableService.addOneTable(req.body, options, function (err, value) {
    if (err) {
      console.log("Erreur lors de la création de la table:", err);

      if (err.type_error === "no-found") {
        return res.status(404).send({
          msg: err.msg || "Ressource non trouvée.",
          type_error: "no-found",
        });
      } else if (err.type_error === "validator") {
        return res.status(400).send({
          msg: err.msg || "Erreur de validation.",
          fields_with_error: err.fields_with_error,
          fields: err.fields,
          type_error: "validator",
        }); // Modifier à 400 pour le validation error
      } else if (err.type_error === "duplicate-table-number") {
        return res.status(409).send({
          msg: err.msg || "Numéro de table déjà utilisé.",
          type_error: "duplicate-table-number",
        }); // Code 409 pour conflit, plus approprié pour les duplications
      } else {
        return res.status(500).send({
          msg: err.msg || "Erreur inconnue",
          type_error: "unknown-error",
        });
      }
    } else {
      console.log("Table créée avec succès:", value);
      res.status(201).send({
        msg: "Table créée avec succès.",
        table: value,
      });
    }
  });
};

// La fonction permet de créer plusieurs tables
module.exports.addManyTables = function (req, res) {
  req.log.info("Création de plusieurs tables");

  // Vérifier que l'utilisateur est bien un manager
  if (req.user.role !== "manager") {
    return res.status(403).send({
      msg: "Vous n'êtes pas autorisé à créer des tables.",
      type_error: "not-authorized",
    });
  }

  var options = { user: req.user };

  // Vérifier que le corps de la requête contient un tableau avec des tables
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).send({
      msg: "Aucune table spécifiée ou format incorrect.",
      type_error: "bad-request",
    });
  }

  // Appel du service pour ajouter plusieurs tables
  TableService.addManyTables(req.body, options, function (err, result) {
    if (err) {
      // Gestion des différents types d'erreurs
      switch (err.type_error) {
        case "no-restaurant":
        case "missing-user":
          return res.status(404).send(err);
        case "validator":
          return res.status(400).send(err); // Code 400 pour les erreurs de validation
        case "duplicate-table-number":
          return res.status(409).send({
            msg: err.msg,
            type_error: "duplicate-table-number", // Code 409 pour les conflits (doublons)
          });
        default:
          return res.status(500).send({
            msg: err.msg || "Erreur inconnue",
            type_error: "unknown-error",
          });
      }
    }

    // Envoi du résultat en cas de succès
    return res.status(201).send({
      msg: "Tables créées avec succès.",
      created_tables: result,
    });
  });
};

// La fonction permet de récupérer toutes les tables avec pagination.
// Fonction pour rechercher toutes les tables avec pagination et filtrer par restaurant_id
module.exports.findManyTables = function (req, res) {
  const { restaurant_id, search, page, limit } = req.query;

  // Options pour la recherche, y compris le restaurant_id si fourni
  const options = {
    restaurant_id: restaurant_id || null,
    populate: [], // Ajoutez ici les champs à populater si nécessaire
  };

  TableService.findManyTables(search, page, limit, options, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la recherche des tables.",
        type_error: err.type_error || "unknown_error",
        error: err.error || err.message,
      });
    }
    res.status(200).json(result);
  });
};

// La fonction permet de rechercher une table par son ID.
module.exports.findOneTableById = function (req, res) {
  req.log.info("Recherche d'une table par son id");
  var opts = { populate: req.query.populate };
  TableService.findOneTableById(req.params.id, opts, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de trouver plusieurs tables avec l'ID.
module.exports.findManyTablesById = function (req, res) {
  req.log.info("Chercher plusieurs utilisateurs");
  let tableId = req.query.id;
  if (tableId && !Array.isArray(tableId)) tableId = [tableId];

  TableService.findManyTablesById(tableId, null, function (err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de mettre à jour une table.
module.exports.updateOneTable = function (req, res) {
  req.log.info("Modification d'une table");

  TableService.updateOneTable(
    req.params.id,
    req.body,
    null,
    function (err, value) {
      if (err && err.type_error == "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (
        err &&
        (err.type_error == "no-valid" ||
          err.type_error == "validator" ||
          err.type_error == "duplicate")
      ) {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "error-mongo") {
        res.statusCode = 500;
        res.send(err);
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    },
  );
};

// La fonction permet de mettre à jour plusieurs tables.
module.exports.updateManyTables = function (req, res) {
  req.log.info("Modification de plusieurs tables");
  let tableId = req.query.id;
  if (tableId && !Array.isArray(tableId)) tableId = [tableId];

  const updateData = req.body;

  TableService.updateManyTables(
    tableId,
    updateData,
    null,
    function (err, value) {
      if (err && err.type_error === "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (
        err &&
        (err.type_error == "no-valid" ||
          err.type_error == "validator" ||
          err.type_error == "duplicate")
      ) {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "duplicate") {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "error-mongo") {
        res.statusCode = 500;
        res.send(err);
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    },
  );
};

// La fonction permet d'archiver une table
module.exports.archiveOneTable = async (req, res) => {
  const table_id = req.params.id;
  // Vérifiez si l'ID est valide avant d'appeler le service
  if (!table_id || !mongoose.isValidObjectId(table_id)) {
    return res.status(400).json({
      message: "Id de table invalide.",
      type_error: "no-valid",
    });
  }

  // Appel du service pour archiver la table
  TableService.archiveOneTable(table_id, {}, (error, result) => {
    if (error) {
      // Si une erreur survient dans le service, retournez une erreur au client
      if (error.type_error === "no-found") {
        return res.status(404).json({
          message: "Table non trouvée.",
          type_error: "no-found",
        });
      }
      return res.status(500).json({
        message: "Erreur lors de l'archivage de la table.",
        type_error: error.type_error || "unknown",
        error: error.error || error,
      });
    }

    // Retourner la table archivée avec succès
    return res.status(200).json({
      message: "Table archivée avec succès.",
      data: result,
    });
  });
};

// La fonction permet de supprimer une table
module.exports.deleteOneTable = function (req, res) {
  req.log.info("Suppression d'une table");

  if (req.user.role !== "manager") {
    return res.status(403).send({
      msg: "Vous n'êtes pas autorisé à supprimer une table.",
      type_error: "not-authorized",
    });
  }

  TableService.deleteOneTable(req.params.id, function (err, value) {
    if (err && err.type_error === "no-found") {
      res.status(404).send(err);
    } else if (err && err.type_error === "no-valid") {
      res.status(405).send(err);
    } else if (err && err.type_error === "error-mongo") {
      res.status(500).send(err);
    } else {
      res.status(200).send({
        msg: "Table supprimée avec succès",
        table: value,
      });
    }
  });
};

// La fonction permet de supprimer plusieurs tables
module.exports.deleteManyTables = function (req, res) {
  req.log.info("Suppression de plusieurs tables");

  if (req.user.role !== "manager") {
    return res.status(403).send({
      msg: "Vous n'êtes pas autorisé à supprimer des tables.",
      type_error: "not-authorized",
    });
  }

  let tableIds = req.query.id;
  if (tableIds && !Array.isArray(tableIds)) {
    tableIds = [tableIds];
  }

  TableService.deleteManyTables(tableIds, function (err, value) {
    if (err && err.type_error === "no-found") {
      res.status(404).send(err);
    } else if (err && err.type_error === "no-valid") {
      res.status(405).send(err);
    } else if (err && err.type_error === "error-mongo") {
      res.status(500).send(err);
    } else {
      res.status(200).send({
        msg: "Tables supprimées avec succès",
        tables: value,
      });
    }
  });
};
