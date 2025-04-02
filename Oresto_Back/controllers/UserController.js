const UserService = require("../services/UserService");
const RestaurantService = require("../services/RestaurantService");
const logger = require("../utils/logger").pino;
const passport = require("passport");
const User = require("../schemas/User");
const Restaurant = require("../schemas/Restaurant");

// La fonction permet d'ajouter un manager
module.exports.addOneManager = function (req, res) {

  req.log.info("Création d'un utilisateur");
  const ManagerRole = { ...req.body, role: "manager" };
  UserService.addOneUser(ManagerRole, null, function (err, value) {
    if (err && err.type_error == "no found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "validator") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "duplicate") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// la fonction pour gérer l'authentification manager depuis UserService
module.exports.loginManager = function (req, res, next) {
  const { email, password } = req.body;

  UserService.loginUser(email, password, null, async (err, user) => {
    if (err) {
      res.statusCode = 401;
      return res.send({
        msg: "Authentication required.",
        type_error: "unauthorized",
      });
    }
    if (user.role !== "manager") {
      res.statusCode = 403;
      return res.send({
        msg: "Accès refusé. Vous devez être un manager pour vous connecter.",
        type_error: "forbidden",
      });
    }

    try {
      // Vérifier si l'utilisateur a un restaurant_id
      if (!user.restaurant_id) {
        // Rechercher directement le restaurant où user_id correspond à l'ID de l'utilisateur
        const restaurant = await Restaurant.findOne({
          user_id: user._id,
        }).lean();

        if (restaurant) {
          // Mettre à jour l'utilisateur avec le restaurant_id si trouvé
          await User.updateOne(
            { _id: user._id },
            { $set: { restaurant_id: restaurant._id.toString() } },
          );

          // Ajouter le restaurant à l'objet utilisateur
          user.restaurant = restaurant;
        } else {
          req.log.info(
            "Aucun restaurant n'est associé à ce manager:",
            user._id,
          );
          user.restaurant = null;
        }
      } else {
        // Si restaurant_id existe, récupérer les détails du restaurant
        const restaurant = await Restaurant.findById(user.restaurant_id).lean();
        if (restaurant) {
          user.restaurant = restaurant;
        } else {
          req.log.info("Restaurant non trouvé pour l'ID:", user.restaurant_id);
          user.restaurant = null;
        }
      }

      // Configurer le cookie HTTP-only avec le token
      res.cookie("auth_token", user.token, {
        httpOnly: true,
        secure: true, // Toujours true en production car nous utilisons HTTPS
        sameSite: "none", // Essentiel pour le cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
        path: "/",
      });

      // Ne pas renvoyer le token dans la réponse JSON
      const { token, ...userWithoutToken } = user;

      // En mode test, on renvoie aussi le token pour permettre aux tests de l’utiliser
      if (process.env.NODE_ENV === "test") {
        res.statusCode = 200;
        return res.send({ ...userWithoutToken, token });
      } else {
        res.statusCode = 200;
        return res.send(userWithoutToken);
      }

      // Token visible en version test, introuvable dans le json en version prod
      if (process.env.NODE_ENV === 'test') {
        return res.status(200).send({ ...userWithoutToken, token });
      } else {
        return res.status(200).send(userWithoutToken);
      }

      req.log.info(
        "Connexion manager réussie, restaurant:",
        userWithoutToken.restaurant
          ? userWithoutToken.restaurant._id
          : "aucun restaurant",
      );

      res.statusCode = 200;
      return res.send(userWithoutToken);
    } catch (error) {
      req.log.error("Erreur lors de la récupération des restaurants:", error);
      res.statusCode = 500;
      return res.send({
        msg: "Erreur serveur lors de la récupération des données du restaurant.",
        type_error: "server_error",
      });
    }
  });
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create a new user (Register)
 *     description: Create a new user with the provided details.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/MongoError'
 */

// La fonction permet d'ajouter un utilisateur
module.exports.addOneUser = function (req, res) {
  req.log.info("Création d'un utilisateur");
  // Log du body pour vérifier que les données arrivent bien
  console.log("Body:", req.body);

  UserService.addOneUser(req.body, null, function (err, value) {
    console.log("Callback de addOneUser", { err, value });
    if (err) {
      // Log détaillé pour chaque type d'erreur
      console.error("Erreur :", err);
      if (err.type_error == "no found") {
        res.status(404).send(err);
      } else if (err.type_error == "validator") {
        res.status(405).send(err);
      } else if (err.type_error == "duplicate") {
        res.status(405).send(err);
      } else if (err.type_error == "error-mongo") {
        res.status(500).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.status(201).send(value);
    }
  });
};

/**
 * @swagger
 * /add_users:
 *   post:
 *     summary: Create many users
 *     description: Create many users with the provided details.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Users are created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 */

// La fonction permet d'ajouter plusieurs utilisateurs
module.exports.addManyUsers = function (req, res) {
  req.log.info("Création de plusieurs utilisateurs");
  UserService.addManyUsers(req.body, null, function (err, value) {
    if (err) {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

/**
 * @swagger
 * /login:
 *    post:
 *      summary: Login user
 *      description: Login user with the provided details.
 *      tags:
 *        - User
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Login'
 *      responses:
 *        200:
 *          description: Login successfully.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        404:
 *          $ref: '#/components/responses/NotFound'
 *        405:
 *          $ref: '#/components/responses/ValidationError'
 *        500:
 *          $ref: '#/components/responses/InternalError'
 */

// la fonction pour gérer l'authentification depuis UserService
module.exports.loginUser = function (req, res) {
  const { email, password } = req.body;

  UserService.loginUser(email, password, null, (err, user) => {
    if (err) {
      res.statusCode = 401;
      return res.send({
        msg: "Authentication required.",
        type_error: "unauthorized",
      });
    }

    // Créer un cookie auth_token
    res.cookie("auth_token", user.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const { token, ...userWithoutToken } = user;

    // Pour les tests : on retourne aussi le token dans la réponse
    if (process.env.NODE_ENV === "test") {
      return res.status(200).send({ ...userWithoutToken, token });
    }

    return res.status(200).send(userWithoutToken);
  });
};

// Déconnecter un utilisateur
module.exports.logoutUser = function (req, res) {
  req.log.info("Déconnexion d'un utilisateur");
  UserService.updateOneUser(
    req.user._id,
    { token: "" },
    null,
    function (err, value) {
      if (err && err.type_error == "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (err && err.type_error == "validator") {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "duplicate") {
        res.statusCode = 405;
        res.send(err);
      } else {
        // Effacer le cookie d'authentification
        res.clearCookie("auth_token", {
          httpOnly: true,
          secure: true, // Toujours true en production car nous utilisons HTTPS
          sameSite: "none", // Essentiel pour le cross-origin
          path: "/",
        });

        res.statusCode = 201;
        res.send({ message: "L'utilisateur est déconnecté" });
      }
    },
  );
};

/**
 * @swagger
 * /find_user/{id}:
 *   get:
 *     summary: Find one user by Id
 *     description: Find one user with the Id_ provided.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User finded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/MongoError'
 */
// La fonction permet de chercher un utilisateur
module.exports.findOneUserById = function (req, res) {
  req.log.info("Recherche d'un utilisateur par son id");
  UserService.findOneUserById(req.params.id, null, function (err, value) {
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

// La fonction permet de chercher un utilisateur par les champs autorisés
module.exports.findOneUser = function (req, res) {

  req.log.info("Recherche d'un utilisateur par un champ autorisé");
  let fields = req.query.fields;
  if (fields && !Array.isArray(fields)) fields = [fields];
  UserService.findOneUser(fields, req.query.value, null, function (err, value) {
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

// La fonction permet de chercher plusieurs utilisateurs avec pagination
module.exports.findManyUsers = function (req, res) {
  req.log.info("Chercher plusieurs utilisateurs");
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let search = req.query.q;

  UserService.findManyUsers(search, page, pageSize, function (err, value) {
    if (err && err.type_error === "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error === "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher plusieurs clients avec pagination
module.exports.findManyClients = function (req, res) {
  req.log.info("Chercher plusieurs clients");
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let search = req.query.q;

  UserService.findManyClients(search, page, pageSize, function (err, value) {
    if (err && err.type_error === "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error === "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de trouver plusieurs utilisateurs.
module.exports.findManyUsersById = function (req, res) {
  req.log.info("Chercher plusieurs utilisateurs");
  let userId = req.query.id;
  if (userId && !Array.isArray(userId)) userId = [userId];

  UserService.findManyUsersById(userId, null, function (err, value) {
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

// La fonction permet de modifier un utilisateur

module.exports.updateOneUser = function (req, res) {

  req.log.info("Modification d'un utilisateur");
  UserService.updateOneUser(
    req.params.id,
    req.body,
    null,
    function (err, value) {
      //    console.log(err, value);
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
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    },
  );
};

// La fonction permet de modifier plusieurs utilisateurs
module.exports.updateManyUsers = function (req, res) {
  req.log.info("Modification de plusieurs utilisateurs");
  let userId = req.query.id;
  if (userId && !Array.isArray(userId)) userId = [userId];
  const updateData = req.body;
  UserService.updateManyUsers(userId, updateData, null, function (err, value) {
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
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de supprimer un utilisateur
module.exports.deleteOneUser = function (req, res) {

  req.log.info("Suppression d'un utilisateur");
  UserService.deleteOneUser(req.params.id, null, function (err, value) {
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

// La fonction permet de supprimer plusieurs utilisateurs
module.exports.deleteManyUsers = function (req, res) {

  req.log.info("Suppression de plusieurs utilisateur");
  var arg = req.query.id;
  if (arg && !Array.isArray(arg)) arg = [arg];
  UserService.deleteManyUsers(arg, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// Vérifier le token JWT
module.exports.verifyToken = function (req, res) {
  // Définir l'en-tête pour forcer une réponse JSON
  res.setHeader("Content-Type", "application/json");

  // Si nous arrivons ici, cela signifie que le token est valide (vérifié par passport)
  // Renvoyer les informations utilisateur à jour
  req.log.info("Vérification du token");

  // Vérifier si req.user existe bien
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      msg: "Non authentifié",
      type_error: "unauthorized",
    });
  }

  // Récupération de l'utilisateur complet avec les informations du restaurant
  User.findById(req.user._id)
    .populate("restaurant")
    .lean()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          msg: "Utilisateur non trouvé",
          type_error: "no-found",
        });
      }

      // Ne pas renvoyer le mot de passe ni le token
      const { password, token, ...userWithoutSensitiveData } = user;
      res.status(200).json(userWithoutSensitiveData);
    })
    .catch((err) => {
      res.status(500).json({
        msg: "Erreur lors de la récupération des informations utilisateur",
        type_error: "server-error",
        details: err.message,
      });
    });
};

// Rafraîchir le token JWT
module.exports.refreshToken = function (req, res) {
  req.log.info("Rafraîchissement du token");

  const TokenUtils = require("../utils/token");
  const newToken = TokenUtils.createToken({ _id: req.user._id }, null);

  // Mettre à jour le token dans la base de données
  UserService.updateOneUser(
    req.user._id,
    { token: newToken },
    null,
    (err, updatedUser) => {
      if (err) {
        return res.status(500).json({
          msg: "Erreur lors du rafraîchissement du token",
          type_error: "server-error",
          details: err,
        });
      }

      // Mettre à jour le cookie avec le nouveau token
      res.cookie("auth_token", newToken, {
        httpOnly: true,
        secure: true, // Toujours true en production car nous utilisons HTTPS
        sameSite: "none", // Essentiel pour le cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      // Renvoyer l'utilisateur sans le token
      User.findById(req.user._id)
        .populate("restaurant")
        .lean()
        .then((user) => {
          if (!user) {
            return res.status(404).json({
              msg: "Utilisateur non trouvé",
              type_error: "no-found",
            });
          }

          // Ne pas renvoyer le mot de passe ni le token
          const { password, token, ...userWithoutSensitiveData } = user;
          res.status(200).json(userWithoutSensitiveData);
        })
        .catch((err) => {
          res.status(500).json({
            msg: "Erreur lors de la récupération des informations utilisateur",
            type_error: "server-error",
            details: err.message,
          });
        });
    },
  );
};
