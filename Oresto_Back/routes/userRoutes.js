const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/UserController");
const DatabaseMiddleware = require("../middlewares/database");

// Routes pour l'authentification
router.post(
  "/register_manager",
  DatabaseMiddleware.checkConnection,
  UserController.addOneManager,
);
router.post(
  "/login_manager",
  DatabaseMiddleware.checkConnection,
  UserController.loginManager,
);
router.post(
  "/register",
  DatabaseMiddleware.checkConnection,
  UserController.addOneUser,
);
router.post(
  "/login",
  DatabaseMiddleware.checkConnection,
  UserController.loginUser,
);
router.post(
  "/logout",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.logoutUser,
);

// Nouvelles routes d'authentification
router.get(
  "/verify-token",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.verifyToken,
);
router.post(
  "/refresh-token",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.refreshToken,
);

// Routes pour la gestion des utilisateurs
router.post(
  "/add_users",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.addManyUsers,
);
router.get(
  "/find_user/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.findOneUserById,
);
router.get(
  "/find_user",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.findOneUser,
);
router.get(
  "/users_by_filters",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.findManyUsers,
);
router.get(
  "/clients_by_filters",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.findManyClients,
);
router.get(
  "/find_users",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.findManyUsersById,
);
router.put(
  "/update_user/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.updateOneUser,
);
router.put(
  "/update_users",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.updateManyUsers,
);
router.delete(
  "/delete_user/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.deleteOneUser,
);
router.delete(
  "/delete_users",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  UserController.deleteManyUsers,
);

module.exports = router;
