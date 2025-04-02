const User = require("../schemas/User");
const Restaurant = require("../schemas/Restaurant");

const _ = require("lodash");
const async = require("async");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const TokenUtils = require("../utils/token");
const SALT_WORK_FACTOR = 10;
const jwt = require("jsonwebtoken");
const Config = require("../config");
const { APIError } = require("../middlewares/errorHandler");

// Ajouter un utilisateur
module.exports.addOneUser = async function (user, options, callback) {
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (user && user.password)
      user.password = await bcrypt.hash(user.password, salt);
    var new_user = new User(user);
    var errors = new_user.validateSync();
    if (errors) {
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
    } else {
      await new_user.save();
      callback(null, new_user.toObject());
    }
  } catch (error) {
    if (error.code === 11000) {
      // Erreur de duplicité
      var field = Object.keys(error.keyValue)[0];
      var err = {
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: "duplicate",
      };
      callback(err);
    } else {
      callback(error); // Autres erreurs
    }
  }
};

// Ajouter plusieurs utilisateurs
module.exports.addManyUsers = async function (users, options, callback) {
  var errors = [];
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (user && user.password)
      user.password = await bcrypt.hash(user.password, salt);
    var new_user = new User(user);
    var error = new_user.validateSync();
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
      const data = await User.insertMany(users, { ordered: false });
      callback(null, data);
    } catch (error) {
      if (error.code === 11000) {
        const duplicateErrors = error.writeErrors.map((err) => {
          const field = err.err.errmsg
            .split(" dup key: { ")[1]
            .split(":")[0]
            .trim();
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

// La fonction permet de connecter un utilisateur
module.exports.loginUser = function (email, password, options, callback) {
  module.exports.findOneUser(["email"], email, null, async (err, user) => {
    if (err) return callback(err);
    if (!user) {
      return callback(
        new APIError("Identifiants incorrects", 401, "authentication_error")
      );
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return callback(
        new APIError("Identifiants incorrects", 401, "authentication_error")
      );
    }

    try {
      const token = TokenUtils.createToken({ _id: user._id }, null);

      // On met à jour l'utilisateur avec le nouveau token
      await User.updateOne({ _id: user._id }, { token });

      // Puis on récupère à nouveau l'utilisateur avec ses données à jour
      const fullUser = await User.findById(user._id).populate("restaurant").lean();

      if (!fullUser) {
        return callback(
          new APIError("Utilisateur introuvable", 404, "no-found")
        );
      }

      // On retourne l'utilisateur avec le token
      callback(null, { ...fullUser, token });
    } catch (error) {
      callback(
        new APIError(
          "Erreur serveur lors de la connexion",
          500,
          "server_error",
          { originalError: error.message }
        )
      );
    }
  });
};

module.exports.findOneUser = function (tab_field, value, options, callback) {
  var field_unique = ["email"];
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

    // Utilisation de `populate` pour remplir les informations de `restaurant`
    User.findOne({ $or: obj_find })
      .populate("restaurant") // Ajout de la commande `populate`
      .lean()
      .then((user) => {
        if (!user) {
          return callback(null, null);
        }
        callback(null, user);
      })
      .catch((err) => {
        callback(
          new APIError("Erreur lors de la recherche", 500, "database_error", {
            originalError: err.message,
          }),
        );
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
    } else {
      callback({ msg: msg, type_error: "no-valid" });
    }
  }
};

// La fonction permet de rechercher tous les utilisateurs
module.exports.findManyUsers = function (search, page, limit, callback) {
  page = !page ? 1 : parseInt(page);
  limit = !limit ? 10 : parseInt(limit);
  if (isNaN(page) || isNaN(limit)) {
    callback({
      msg: `Format de ${isNaN(page) ? "page" : "limit"} invalide.`,
      type_error: "no-valid",
    });
  } else {
    let query_mongo = search
      ? {
        $or: _.map(
          ["firstname", "lastname", "phone_number", "email"],
          (e) => {
            return { [e]: { $regex: search, $options: "i" } }; // Ajout de $options: 'i' pour insensible à la casse
          },
        ),
      }
      : {};
    User.countDocuments(query_mongo)
      .then((value) => {
        if (value > 0) {
          const skip = (page - 1) * limit;
          User.find(query_mongo, null, { skip: skip, limit: limit })
            .then((results) => {
              callback(null, { results: results, count: value });
            })
            .catch((e) => {
              callback({
                msg: "Erreur lors de la recherche des utilisateurs.",
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
          msg: "Erreur lors du comptage des utilisateurs.",
          type_error: "error-mongo",
          error: e,
        });
      });
  }
};

// La fonction permet de retrouver les clients (role : user)
module.exports.findManyClients = function (search, page, limit, callback) {
  page = !page ? 1 : parseInt(page);
  limit = !limit ? 100000000 : parseInt(limit);

  if (isNaN(page) || isNaN(limit)) {
    callback({
      msg: `Format de ${isNaN(page) ? "page" : "limit"} invalide.`,
      type_error: "no-valid",
    });
  } else {
    let query_mongo = {
      role: "user",
      ...(search
        ? {
          $or: _.map(
            ["firstname", "lastname", "phone_number", "email"],
            (e) => {
              return { [e]: { $regex: search, $options: "i" } }; // Ajout de $options: 'i' pour insensible à la casse
            },
          ),
        }
        : {}),
    };
    User.countDocuments(query_mongo)
      .then((value) => {
        if (value > 0) {
          const skip = (page - 1) * limit;
          User.find(query_mongo, null, { skip: skip, limit: limit })
            .then((results) => {
              callback(null, { results: results, count: value });
            })
            .catch((e) => {
              callback({
                msg: "Erreur lors de la recherche des utilisateurs.",
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
          msg: "Erreur lors du comptage des utilisateurs.",
          type_error: "error-mongo",
          error: e,
        });
      });
  }
};

// La fonction permet de recherche un utilisateur par son ID
module.exports.findOneUserById = function (user_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findById(user_id, null, { populate: ["restaurant"], lean: true })
      .then((value) => {
        try {
          if (value) {
            callback(null, value);
          } else {
            throw new APIError("Aucun utilisateur trouvé.", 404, "not_found");
          }
        } catch (e) { }
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

// La fonction permet de rechercher plusieurs utilisateurs avec leur ID
module.exports.findManyUsersById = function (users_id, options, callback) {
  if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == users_id.length
  ) {
    users_id = users_id.map((e) => {
      return new ObjectId(e);
    });
    User.find({ _id: users_id })
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
          } else {
            throw new APIError("Aucun utilisateur trouvé.", 404, "not_found");
          }
        } catch (e) { }
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != users_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: users_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (users_id && !Array.isArray(users_id)) {
    callback({
      msg: "L'argement n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

// La fonction permet de mettre à jour un utilisateur
module.exports.updateOneUser = async function (
  user_id,
  update,
  options,
  callback,
) {
  if (!user_id || !mongoose.isValidObjectId(user_id)) {
    return callback({ msg: "Id invalide.", type_error: "no-valid" });
  }

  try {
    if (update && update.password) {
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      update.password = await bcrypt.hash(update.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(user_id, update, {
      new: true,
      runValidators: true,
    })
      .populate("restaurant")
      .lean();

    if (!updatedUser) {
      return callback({
        msg: "Utilisateur non trouvé.",
        type_error: "not_found",
      });
    }

    callback(null, updatedUser);
  } catch (errors) {
    if (errors.code === 11000) {
      const field = Object.keys(errors.keyPattern)[0];
      callback({
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: "duplicate",
      });
    } else if (errors.name === "ValidationError") {
      const fields = Object.keys(errors.errors).reduce((acc, key) => {
        acc[key] = errors.errors[key].message;
        return acc;
      }, {});
      callback({
        msg: "Erreur de validation.",
        fields_with_error: Object.keys(fields),
        fields,
        type_error: "validator",
      });
    } else {
      console.error(
        "Erreur inattendue lors de la mise à jour utilisateur :",
        errors,
      );
      callback({
        msg: "Erreur interne du serveur.",
        type_error: "error-mongo",
      });
    }
  }
};

// La fonction permet de mettre à jour  plusieurs utilisateurs
module.exports.updateManyUsers = async function (
  users_id,
  update,
  options,
  callback,
) {
  if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == users_id.length
  ) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (update && update.password)
      update.password = await bcrypt.hash(update.password, salt);
    users_id = users_id.map((e) => {
      return new ObjectId(e);
    });
    User.updateMany({ _id: users_id }, update, { runValidators: true })
      .then((value) => {
        try {
          if (value && value.matchedCount != 0) callback(null, value);
          else {
            throw new APIError("Aucun utilisateur trouvé.", 404, "not_found");
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

// La fonction permet de supprimer un utilisateur
module.exports.deleteOneUser = function (user_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findByIdAndDelete(user_id)
      .then((value) => {
        if (value) {
          callback(null, value.toObject());
        } else {
          callback({
            msg: "Utilisateur non trouvé.",
            type_error: "no-found",
          });
        }
      })
      .catch((e) => {
        callback({
          msg: "Erreur lors de la suppression.",
          type_error: "error-mongo",
          error: e,
        });
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

// La fonction permet de supprimer plusieurs utilisateur
module.exports.deleteManyUsers = function (users_id, options, callback) {
  if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == users_id.length
  ) {
    users_id = users_id.map((e) => {
      return new ObjectId(e);
    });
    User.deleteMany({ _id: users_id })
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
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != users_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: users_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (users_id && !Array.isArray(users_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau d'id invalide.", type_error: "no-valid" });
  }
};
