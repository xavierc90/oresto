const Restaurant = require("../schemas/Restaurant");
const User = require("../schemas/User");
const OpeningHoursService = require("./OpeningHoursService"); // Importer le service OpeningHours
const _ = require("lodash");
const async = require("async");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { APIError } = require("../middlewares/errorHandler");

// Ajouter un restaurant et créer les plages horaires par défaut
module.exports.addOneRestaurant = async function (
  restaurant,
  options,
  callback,
) {
  try {
    restaurant.user_id =
      options && options.user ? options.user._id : restaurant.user_id;
    var new_restaurant = new Restaurant(restaurant);
    var errors = new_restaurant.validateSync();
    if (errors) {
      const errorMessages = Object.values(errors.errors)
        .map((e) => e.message)
        .join(" ");
      const fields = _.mapValues(errors.errors, (e) => e.message);
      callback({
        msg: errorMessages,
        fields_with_error: Object.keys(errors.errors),
        fields: fields,
        type_error: "validator",
      });
    } else {
      // Save the new restaurant
      await new_restaurant.save();

      // Update the user's restaurant_id field
      const updateResult = await User.updateOne(
        { _id: restaurant.user_id },
        { $set: { restaurant_id: new_restaurant._id.toString() } },
      );

      if (updateResult.modifiedCount === 0) {
        throw new APIError(
          "Échec de la mise à jour de l'ID du restaurant pour l'utilisateur",
          500,
          "user_update_failed",
        );
      }

      // Appel à la fonction addOpeningHours pour créer automatiquement les plages horaires par défaut
      await OpeningHoursService.addOpeningHours(
        new_restaurant._id,
        restaurant.user_id,
      );

      callback(null, new_restaurant.toObject());
    }
  } catch (error) {
    console.error("Error in addOneRestaurant:", error);
    callback(error);
  }
};

// Ajouter plusieurs restaurants
module.exports.addManyRestaurants = async function (
  restaurants,
  options,
  callback,
) {
  var errors = [];
  // Vérifier les erreurs de validation
  for (var i = 0; i < restaurants.length; i++) {
    var restaurant = restaurants[i];
    var new_restaurant = new Restaurant({
      ...restaurant,
    });
    var error = new_restaurant.validateSync();
    if (error) {
      error = error["errors"];
      var text = Object.keys(error)
        .map((e) => {
          return error[e]["properties"]["message"];
        })
        .join(" ");
      var fields = _.transform(
        Object.keys(error),
        function (result, value) {
          result[value] = error[value]["properties"]["message"];
        },
        {},
      );
      errors.push({
        msg: text,
        fields_with_error: Object.keys(error),
        fields: fields,
        index: i,
        type_error: "validator",
      });
    }
  }
  if (errors.length > 0) {
    callback(errors);
  } else {
    try {
      // Tenter d'insérer les restaurants
      const data = await Restaurant.insertMany(restaurants, { ordered: false });
      callback(null, data);
    } catch (error) {
      if (error.code === 11000) {
        // Erreur de duplicité
        const duplicateErrors = error.writeErrors.map((err) => {
          const field = err.err.errmsg
            .split(" dup key: { ")[1]
            .split(":")[0]
            .trim(); // Big brain
          return {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            index: err.index,
            type_error: "duplicate",
          };
        });
        callback(duplicateErrors);
      } else {
        callback(error); // Autres erreurs
      }
    }
  }
};

// Fonction pour la recherche d'un restaurant //

module.exports.findOneRestaurant = function (
  tab_field,
  value,
  options,
  callback,
) {
  var opts = { populate: options && options.populate ? ["user_id"] : [] };
  var field_unique = [
    "name",
    "address",
    "city",
    "postal_code",
    "country",
    "user_id",
  ];

  if (
    tab_field &&
    Array.isArray(tab_field) &&
    value &&
    _.filter(tab_field, (e) => {
      return field_unique.indexOf(e) == -1;
    }).length == 0
  ) {
    var obj_find = [];
    _.forEach(tab_field, (e) => {
      obj_find.push({ [e]: value });
    });
    Restaurant.findOne({ $or: obj_find }, null, opts)
      .then((value) => {
        if (value) {
          callback(null, value.toObject());
        } else {
          throw new APIError("Restaurant non trouvé", 404, "not_found");
        }
      })
      .catch((err) => {
        callback({ msg: "Error interne mongo.", type_error: "error-mongo" });
      });
  } else {
    let msg = "";
    if (!tab_field || !Array.isArray(tab_field)) {
      msg += "Les champs de recherche sont incorrects. ";
    }
    if (!value) {
      msg += msg
        ? "Et la valeur de recherche est vide. "
        : "La valeur de recherche est vide. ";
    }
    if (
      _.filter(tab_field, (e) => {
        return field_unique.indexOf(e) == -1;
      }).length > 0
    ) {
      var field_not_authorized = _.filter(tab_field, (e) => {
        return field_unique.indexOf(e) == -1;
      });
      msg += msg
        ? ` Et (${field_not_authorized.join(
            ",",
          )}) ne sont pas des champs de recherche autorisés.`
        : `Les champs (${field_not_authorized.join(
            ",",
          )}) ne sont pas des champs de recherche autorisés.`;
      callback({
        msg: msg,
        type_error: "no-valid",
        field_not_authorized: field_not_authorized,
      });
    } else callback({ msg: msg, type_error: "no-valid" });
  }
};

// Fonction pour la recherche de plusieurs restaurants

module.exports.findManyRestaurants = function (
  search,
  page,
  limit,
  options,
  callback,
) {
  page = !page ? 1 : parseInt(page);
  limit = !limit ? 10 : parseInt(limit);
  var populate = options && options.populate ? ["user_id"] : [];

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return callback({
      msg: `Format de ${isNaN(page) ? "page" : "limit"} invalide.`,
      type_error: "no-valid",
    });
  }

  let query_mongo = search
    ? {
        $or: ["name", "postal_code", "city", "country", "user_id"].map(
          (field) => ({ [field]: { $regex: search, $options: "i" } }),
        ),
      }
    : {};

  Restaurant.countDocuments(query_mongo)
    .then((count) => {
      if (count > 0) {
        const skip = (page - 1) * limit;
        Restaurant.find(query_mongo, null, {
          skip: skip,
          limit: limit,
          populate: populate,
          lean: true,
        })
          .then((results) => {
            callback(null, {
              results: results,
              count: count,
            });
          })
          .catch((e) => {
            callback({
              msg: "Erreur lors de la recherche des restaurants.",
              type_error: "error-mongo",
              error: e,
            });
          });
      } else {
        callback(null, { results: [], count: 0 });
      }
    })
    .catch((e) => {
      callback({
        msg: "Erreur lors de la recherche des restaurants.",
        type_error: "error-mongo",
        error: e,
      });
    });
};

// Fonction pour rechercher un restaurant avec son id
module.exports.findOneRestaurantById = function (
  restaurant_id,
  options,
  callback,
) {
  if (restaurant_id && mongoose.isValidObjectId(restaurant_id)) {
    Restaurant.findById(restaurant_id, null, { populate: ["user"], lean: true })
      .then((value) => {
        if (value) {
          callback(null, value);
        } else {
          throw new APIError("Aucun restaurant trouvé", 404, "not_found");
        }
      })
      .catch((err) => {
        console.error("Erreur MongoDB:", err); // Ajout du log de l'erreur
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }
};

// La fonction permet de rechercher plusieurs restaurants par leur id
module.exports.findManyRestaurantsById = function (
  restaurants_id,
  options,
  callback,
) {
  var opts = {
    populate: options && options.populate ? ["user_id"] : [],
    lean: true,
  };
  if (
    restaurants_id &&
    Array.isArray(restaurants_id) &&
    restaurants_id.length > 0 &&
    restaurants_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == restaurants_id.length
  ) {
    restaurants_id = restaurants_id.map((e) => {
      return new ObjectId(e);
    });
    Restaurant.find({ _id: restaurants_id }, null, opts)
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
          } else {
            throw new APIError("Aucun restaurant trouvé", 404, "not_found");
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
    restaurants_id &&
    Array.isArray(restaurants_id) &&
    restaurants_id.length > 0 &&
    restaurants_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != restaurants_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: restaurants_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (restaurants_id && !Array.isArray(restaurants_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

// Fonction pour modifier un restaurant
module.exports.updateOneRestaurant = function (
  restaurant_id,
  update,
  options,
  callback,
) {
  if (restaurant_id && mongoose.isValidObjectId(restaurant_id)) {
    update.updated_at = new Date();
    Restaurant.findByIdAndUpdate(new ObjectId(restaurant_id), update, {
      returnDocument: "after",
      runValidators: true,
    })
      .then((value) => {
        try {
          if (value) {
            callback(null, value.toObject());
          } else {
            throw new APIError("Restaurant non trouvé", 404, "not_found");
          }
        } catch (e) {
          callback(e);
        }
      })
      .catch((errors) => {
        if (errors.code === 11000) {
          var field = Object.keys(errors.keyPattern)[0];
          const duplicateErrors = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate",
          };
          callback(duplicateErrors);
        } else {
          errors = errors["errors"];
          var text = Object.keys(errors)
            .map((e) => {
              return errors[e]["properties"]["message"];
            })
            .join(" ");
          var fields = _.transform(
            Object.keys(errors),
            function (result, value) {
              result[value] = errors[value]["properties"]["message"];
            },
            {},
          );
          var err = {
            msg: text,
            fields_with_error: Object.keys(errors),
            fields: fields,
            type_error: "validator",
          };
          callback(err);
        }
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

// Fonction pour modifier plusieurs restaurants

module.exports.updateManyRestaurants = function (
  restaurants_id,
  update,
  options,
  callback,
) {
  if (
    restaurants_id &&
    Array.isArray(restaurants_id) &&
    restaurants_id.length > 0 &&
    restaurants_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == restaurants_id.length
  ) {
    restaurants_id = restaurants_id.map((e) => {
      return new ObjectId(e);
    });
    update.updated_at = new Date();
    Restaurant.updateMany({ _id: restaurants_id }, update, {
      runValidators: true,
    })
      .then((value) => {
        try {
          if (value && value.matchedCount != 0) callback(null, value);
          else {
            throw new APIError("Aucun restaurant trouvé", 404, "not_found");
          }
        } catch (e) {
          callback(e);
        }
      })
      .catch((errors) => {
        if (errors.code === 11000) {
          var field = Object.keys(errors.keyPattern)[0];
          const duplicateErrors = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate",
          };
          callback(duplicateErrors);
        } else {
          errors = errors["errors"];
          var text = Object.keys(errors)
            .map((e) => {
              return errors[e]["properties"]["message"];
            })
            .join(" ");
          var fields = _.transform(
            Object.keys(errors),
            function (result, value) {
              result[value] = errors[value]["properties"]["message"];
            },
            {},
          );
          var err = {
            msg: text,
            fields_with_error: Object.keys(errors),
            index: errors.index,
            fields: fields,
            type_error: "validator",
          };
          callback(err);
        }
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

// Fonction pour supprimer un restaurant

module.exports.deleteOneRestaurant = function (
  restaurant_id,
  options,
  callback,
) {
  if (restaurant_id && mongoose.isValidObjectId(restaurant_id)) {
    Restaurant.findByIdAndDelete(restaurant_id)
      .then((value) => {
        try {
          if (value) callback(null, value.toObject());
          else throw new APIError("Restaurant non trouvé", 404, "not_found");
        } catch (e) {
          callback(e);
        }
      })
      .catch((e) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

// Fonction pour supprimer plusieurs restaurants
module.exports.deleteManyRestaurants = function (
  restaurants_id,
  options,
  callback,
) {
  if (
    restaurants_id &&
    Array.isArray(restaurants_id) &&
    restaurants_id.length > 0 &&
    restaurants_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == restaurants_id.length
  ) {
    restaurants_id = restaurants_id.map((e) => {
      return new ObjectId(e);
    });
    Restaurant.deleteMany({ _id: restaurants_id })
      .then((value) => {
        callback(null, value);
      })
      .catch((err) => {
        callback({
          msg: "Erreur mongo suppression.",
          type_error: "error-mongo",
        });
      });
  } else if (
    restaurants_id &&
    Array.isArray(restaurants_id) &&
    restaurants_id.length > 0 &&
    restaurants_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != restaurants_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: restaurants_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (restaurants_id && !Array.isArray(restaurants_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau d'id invalide.", type_error: "no-valid" });
  }
};
