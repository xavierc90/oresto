const Table = require("../schemas/Table");
const TablePlan = require("../schemas/TablePlan");
const TablePlanService = require("./TablePlanService");
const UserService = require("./UserService");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const TokenUtils = require("../utils/token");
const SALT_WORK_FACTOR = 10;
const _ = require("lodash");
const moment = require("moment");
const { APIError } = require("../middlewares/errorHandler");

// Fonction pour créer une table et mettre à jour le plan de table pour la date du jour
module.exports.addOneTable = async function (table, options, callback) {
  try {
    if (!options || !options.user) {
      return callback({
        msg: "No connected user found",
        type_error: "missing-user",
      });
    }

    const restaurant =
      options.user.restaurant && options.user.restaurant.length > 0
        ? options.user.restaurant[0]
        : null;
    if (!restaurant) {
      return callback({
        msg: "No restaurant found for this manager",
        type_error: "no-restaurant",
      });
    }

    table.created_by = options.user._id;
    table.restaurant_id = restaurant._id;

    // Vérifier si une table avec ce numéro existe déjà pour ce restaurant, sauf si elle est en statut "archived"
    const existingTable = await Table.findOne({
      restaurant_id: restaurant._id,
      number: table.number,
      status: { $ne: "archived" }, // On ignore les tables archivées
    }).lean();

    if (existingTable) {
      throw new APIError(
        `Table number ${table.number} already exists for this restaurant.`,
        409,
        "duplicate_table",
      );
    }

    // Enregistrer la nouvelle table
    const new_table = new Table(table);
    const errors = new_table.validateSync();
    if (errors) {
      const errorMessages = [];
      const fields = {};
      for (let errKey in errors.errors) {
        errorMessages.push(errors.errors[errKey].message);
        fields[errKey] = errors.errors[errKey].message;
      }
      return callback({
        msg: errorMessages.join(", "),
        fields_with_error: Object.keys(fields),
        fields: fields,
        type_error: "validator",
      });
    }

    await new_table.save();

    // Normaliser la date du jour (en UTC)
    const today = moment().utc().startOf("day").toDate();

    // Ajouter la nouvelle table dans le plan de table du jour J uniquement
    // Mais ne pas réinclure les tables avec status "archived"
    await TablePlan.updateOne(
      {
        restaurant_id: restaurant._id,
        date: today,
        "tables.table_id": { $ne: new_table._id }, // On s'assure que la table n'existe pas déjà dans le plan
      },
      {
        $addToSet: {
          tables: {
            table_id: new_table._id,
            number: new_table.number,
            capacity: new_table.capacity,
          },
        },
      },
      { upsert: true },
    );

    // Retourner la nouvelle table créée
    callback(null, new_table.toObject());
  } catch (error) {
    console.error("Erreur lors de la création de la table:", error);
    if (error.code === 11000) {
      throw new APIError(
        "Une table avec ce numéro existe déjà dans ce restaurant",
        409,
        "duplicate_table",
      );
    }
    throw new APIError(
      "Erreur lors de la création de la table",
      500,
      "table_creation_error",
      { originalError: error.message },
    );
  }
};

// Fonction pour ajouter plusieurs tables et mettre à jour le plan de table pour la date du jour
module.exports.addManyTables = async function (tables, options, callback) {
  try {
    if (!options || !options.user) {
      return callback({
        msg: "No connected user found",
        type_error: "missing-user",
      });
    }

    const restaurant =
      options.user.restaurant && options.user.restaurant.length > 0
        ? options.user.restaurant[0]
        : null;
    if (!restaurant) {
      return callback({
        msg: "No restaurant found for this manager",
        type_error: "no-restaurant",
      });
    }

    const today = moment().utc().startOf("day").toDate();
    const newTables = [];
    const errors = [];

    for (let table of tables) {
      table.created_by = options.user._id;
      table.restaurant_id = restaurant._id;

      // Vérifier si une table avec ce numéro existe déjà pour ce restaurant, sauf si elle est en statut "archived"
      const existingTable = await Table.findOne({
        restaurant_id: restaurant._id,
        number: table.number,
        status: { $ne: "archived" }, // On ignore les tables archivées
      }).lean();

      if (existingTable) {
        errors.push({
          msg: `Table number ${table.number} already exists for this restaurant.`,
          type_error: "duplicate-table-number",
          table_number: table.number,
        });
        continue; // Skip to the next table
      }

      // Enregistrer la nouvelle table
      const new_table = new Table(table);
      const validationErrors = new_table.validateSync();
      if (validationErrors) {
        const errorMessages = [];
        const fields = {};
        for (let errKey in validationErrors.errors) {
          errorMessages.push(validationErrors.errors[errKey].message);
          fields[errKey] = validationErrors.errors[errKey].message;
        }
        errors.push({
          msg: errorMessages.join(", "),
          fields_with_error: Object.keys(fields),
          fields: fields,
          type_error: "validator",
          table_number: table.number,
        });
        continue;
      }

      await new_table.save();
      newTables.push(new_table);
    }

    // Après la création des tables, mettre à jour ou créer le plan de table du jour
    if (newTables.length > 0) {
      await TablePlan.updateOne(
        {
          restaurant_id: restaurant._id,
          date: today,
        },
        {
          $addToSet: {
            tables: newTables.map((new_table) => ({
              table_id: new_table._id,
              number: new_table.number,
              capacity: new_table.capacity,
              shape: new_table.shape,
              position_x: new_table.position_x,
              position_y: new_table.position_y,
              rotate: new_table.rotate,
            })),
          },
        },
        { upsert: true }, // Créer un nouveau plan de table s'il n'existe pas encore pour aujourd'hui
      );
    }

    if (errors.length > 0) {
      return callback({
        msg: "Certaines tables n'ont pas pu être créées.",
        errors: errors,
        created_tables: newTables.map((t) => t.toObject()),
      });
    }

    // Retourner les nouvelles tables créées
    callback(
      null,
      newTables.map((t) => t.toObject()),
    );
  } catch (error) {
    console.error("Erreur lors de la création des tables:", error);
    callback({
      msg: error.message || "Erreur inconnue",
      type_error: "unknown-error",
    });
  }
};

// Fonction pour rechercher une table par son ID
module.exports.findOneTableById = function (table_id, options, callback) {
  var opts = { populate: options && options.populate ? ["table_id"] : [] };
  if (table_id && mongoose.isValidObjectId(table_id)) {
    Table.findById(table_id, null, opts)
      .then((value) => {
        try {
          if (value) {
            callback(null, value.toObject());
          } else {
            throw new APIError("Aucune table trouvée", 404, "not_found");
          }
        } catch (e) {
          callback({ msg: "Erreur de traitement.", type_error: "error-mongo" });
        }
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }
};

// Fonction pour rechercher toutes les tables avec pagination et filtrer par restaurant_id
module.exports.findManyTables = function (
  search,
  page,
  limit,
  options,
  callback,
) {
  page = !page ? 1 : parseInt(page);
  limit = !limit ? 100 : parseInt(limit);
  var populate = options && options.populate ? options.populate : [];

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return callback({
      msg: `Format de ${isNaN(page) ? "page" : "limit"} invalide.`,
      type_error: "no-valid",
    });
  }

  // Initialiser la requête MongoDB
  let query_mongo = search
    ? {
        $or: ["number", "capacity", "shape"].map((field) => ({
          [field]: { $regex: search, $options: "i" },
        })),
      }
    : {};

  // Si un restaurant_id est fourni, l'ajouter à la requête
  if (options && options.restaurant_id) {
    query_mongo.restaurant_id = options.restaurant_id;
  }

  Table.countDocuments(query_mongo)
    .then((count) => {
      if (count > 0) {
        const skip = (page - 1) * limit;
        Table.find(query_mongo, null, {
          skip: skip,
          limit: limit,
          populate: populate,
          lean: true,
        })
          .then((results) => {
            callback(null, {
              results: results,
              totalcount: count,
            });
          })
          .catch((e) => {
            callback({
              msg: "Erreur lors de la recherche des tables.",
              type_error: "error-mongo",
              error: e,
            });
          });
      } else {
        callback(null, { results: [], totalcount: 0 });
      }
    })
    .catch((e) => {
      callback({
        msg: "Erreur lors de la recherche des tables.",
        type_error: "error-mongo",
        error: e,
      });
    });
};

// La fonction permet de recherche plusieurs tables avec leur ID
module.exports.findManyTablesById = function (tables_id, options, callback) {
  if (
    tables_id &&
    Array.isArray(tables_id) &&
    tables_id.length > 0 &&
    tables_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == tables_id.length
  ) {
    tables_id = tables_id.map((e) => {
      return new ObjectId(e);
    });
    Table.find({ _id: tables_id })
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
          } else {
            throw new APIError("Aucune table trouvée", 404, "not_found");
          }
        } catch (e) {}
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else if (
    tables_id &&
    Array.isArray(tables_id) &&
    tables_id.length > 0 &&
    tables_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != tables_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: tables_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (tables_id && !Array.isArray(tables_id)) {
    callback({
      msg: "L'argement n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

// La fonction permet de mettre à jour une table.
module.exports.updateOneTable = async function (
  table_id,
  update,
  options,
  callback,
) {
  if (table_id && mongoose.isValidObjectId(table_id)) {
    update.updated_at = new Date();
    try {
      // Récupérer la table avant la mise à jour
      const oldTable = await Table.findById(table_id);
      const value = await Table.findByIdAndUpdate(
        new ObjectId(table_id),
        update,
        { returnDocument: "after", runValidators: true },
      );

      if (value) {
        const today = moment().startOf("day").toDate();

        const updateFields = {
          "tables.$.number": value.number,
          "tables.$.capacity": value.capacity,
          "tables.$.shape": value.shape,
          "tables.$.position_x": value.position_x,
          "tables.$.position_y": value.position_y,
          "tables.$.rotate": value.rotate,
        };

        // Si la table était "unavailable" et est maintenant "available", ou si elle reste "unavailable"
        if (value.status === "available" || value.status === "unavailable") {
          updateFields["tables.$.status"] = value.status;
        }

        // Mettre à jour les plans de table à partir d'aujourd'hui
        await TablePlan.updateMany(
          {
            restaurant_id: value.restaurant_id,
            date: { $gte: today },
            "tables.table_id": value._id,
          },
          {
            $set: updateFields,
          },
        );

        callback(null, value.toObject());
      } else {
        throw new APIError("Table non trouvée", 404, "not_found");
      }
    } catch (e) {
      handleUpdateError(e, callback);
    }
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

function handleUpdateError(e, callback) {
  if (e.code === 11000) {
    const field = Object.keys(e.keyPattern)[0];
    const duplicateErrors = {
      msg: `Duplicate key error: ${field} must be unique.`,
      fields_with_error: [field],
      fields: { [field]: `The ${field} is already taken.` },
      type_error: "duplicate",
    };
    callback(duplicateErrors);
  } else {
    const errors = e["errors"];
    const text = Object.keys(errors)
      .map((err) => errors[err]["properties"]["message"])
      .join(" ");
    const fields = _.transform(
      Object.keys(errors),
      (result, value) => {
        result[value] = errors[value]["properties"]["message"];
      },
      {},
    );
    const err = {
      msg: text,
      fields_with_error: Object.keys(errors),
      fields: fields,
      type_error: "validator",
    };
    callback(err);
  }
}

// La fonction permet de mettre à jour plusieurs tables.
module.exports.updateManyTables = async function (
  tables_id,
  update,
  options,
  callback,
) {
  if (
    tables_id &&
    Array.isArray(tables_id) &&
    tables_id.length > 0 &&
    tables_id.every((e) => mongoose.isValidObjectId(e))
  ) {
    tables_id = tables_id.map((e) => new ObjectId(e));
    update.updated_at = new Date();
    try {
      const oldTables = await Table.find({ _id: { $in: tables_id } });
      const value = await Table.updateMany({ _id: tables_id }, update, {
        runValidators: true,
      });

      if (value && value.matchedCount !== 0) {
        const today = moment().startOf("day").toDate();
        const tables = await Table.find({ _id: { $in: tables_id } });

        for (let table of tables) {
          const updateFields = {
            "tables.$.number": table.number,
            "tables.$.capacity": table.capacity,
            "tables.$.shape": table.shape,
            "tables.$.position_x": table.position_x,
            "tables.$.position_y": table.position_y,
          };

          if (table.status === "available" || table.status === "unavailable") {
            updateFields["tables.$.status"] = table.status;
          }

          await TablePlan.updateMany(
            {
              restaurant_id: table.restaurant_id,
              date: { $gte: today },
              "tables.table_id": table._id,
            },
            {
              $set: updateFields,
            },
          );
        }

        callback(null, value);
      } else {
        throw new APIError("Aucune table trouvée", 404, "not_found");
      }
    } catch (e) {
      handleUpdateError(e, callback);
    }
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.archiveOneTable = async function (table_id, options, callback) {
  if (table_id && mongoose.isValidObjectId(table_id)) {
    try {
      // Passer le statut de la table à 'archived'
      const updatedTable = await Table.findByIdAndUpdate(
        table_id,
        { status: "archived" },
        { new: true },
      );

      if (updatedTable) {
        const today = moment().utc().startOf("day").toDate();

        // Retirer uniquement la table archivée du plan de table
        await TablePlan.updateMany(
          {
            restaurant_id: updatedTable.restaurant_id,
            date: { $gte: today },
          },
          {
            $pull: { tables: { table_id: updatedTable._id } },
          },
        );

        // Créer ou mettre à jour le plan de table pour la date actuelle, sans inclure la table archivée
        await TablePlanService.updateOneTablePlan(
          updatedTable.restaurant_id,
          today,
        );

        callback(null, updatedTable.toObject());
      } else {
        throw new APIError("Table non trouvée", 404, "not_found");
      }
    } catch (error) {
      console.error(`Erreur lors de l'archivage de la table: ${error.message}`);
      callback({
        msg: "Erreur lors de l'archivage de la table.",
        type_error: "error-mongo",
      });
    }
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

// Fonction pour supprimer une table
module.exports.deleteOneTable = async function (table_id, callback) {
  try {
    if (!mongoose.isValidObjectId(table_id)) {
      throw new APIError("ID de table invalide", 400, "invalid_id");
    }

    const table = await Table.findById(table_id);
    if (!table) {
      throw new APIError("Table non trouvée", 404, "not_found");
    }

    // Supprimer la table du plan de table actuel
    const today = moment().utc().startOf("day").toDate();
    await TablePlan.updateMany(
      { date: { $gte: today } },
      { $pull: { tables: { table_id: table._id } } },
    );

    // Supprimer la table
    await table.deleteOne();

    callback(null, { message: "Table supprimée avec succès" });
  } catch (error) {
    if (error instanceof APIError) {
      callback(error);
    } else {
      callback({
        msg: "Erreur lors de la suppression de la table",
        type_error: "error-mongo",
      });
    }
  }
};

// Fonction pour supprimer plusieurs tables
module.exports.deleteManyTables = async function (table_ids, callback) {
  try {
    if (!Array.isArray(table_ids)) {
      throw new APIError(
        "Les IDs de tables doivent être fournis dans un tableau",
        400,
        "invalid_input",
      );
    }

    // Vérifier que tous les IDs sont valides
    const invalidIds = table_ids.filter((id) => !mongoose.isValidObjectId(id));
    if (invalidIds.length > 0) {
      throw new APIError(
        "Certains IDs de tables sont invalides",
        400,
        "invalid_ids",
      );
    }

    // Trouver toutes les tables à supprimer
    const tables = await Table.find({ _id: { $in: table_ids } });
    if (tables.length === 0) {
      throw new APIError("Aucune table trouvée", 404, "not_found");
    }

    // Supprimer les tables des plans de table actuels et futurs
    const today = moment().utc().startOf("day").toDate();
    await TablePlan.updateMany(
      { date: { $gte: today } },
      { $pull: { tables: { table_id: { $in: table_ids } } } },
    );

    // Supprimer les tables
    await Table.deleteMany({ _id: { $in: table_ids } });

    callback(null, {
      message: "Tables supprimées avec succès",
      count: tables.length,
    });
  } catch (error) {
    if (error instanceof APIError) {
      callback(error);
    } else {
      callback({
        msg: "Erreur lors de la suppression des tables",
        type_error: "error-mongo",
      });
    }
  }
};
