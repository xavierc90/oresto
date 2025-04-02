const express = require("express");
const router = express.Router();
const passport = require("passport");
const RestaurantController = require("../controllers/RestaurantController");
const DatabaseMiddleware = require("../middlewares/database");

// Routes pour la gestion des restaurants
router.post(
  "/add_restaurant",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.addOneRestaurant,
);

router.post(
  "/add_restaurants",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.addManyRestaurants,
);

router.get(
  "/find_restaurant/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.findOneRestaurantById,
);

router.get(
  "/restaurants_by_filters",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.findManyRestaurants,
);

router.get(
  "/find_restaurants",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.findManyRestaurantsById,
);

router.put(
  "/update_restaurant/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.updateOneRestaurant,
);

router.put(
  "/update_restaurants",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.updateManyRestaurants,
);

router.delete(
  "/delete_restaurant/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.deleteOneRestaurant,
);

router.delete(
  "/delete_restaurants",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  RestaurantController.deleteManyRestaurants,
);

module.exports = router;
