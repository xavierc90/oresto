const express = require("express");
const router = express.Router();
const passport = require("passport");
const OpeningHoursController = require("../controllers/OpeningHoursController");
const DatabaseMiddleware = require("../middlewares/database");

// Routes pour la gestion des horaires d'ouverture
router.post(
  "/add_hours",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  OpeningHoursController.createOpeningHours,
);

router.get(
  "/opening_hours/:restaurantId",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  OpeningHoursController.findOpeningHours,
);

router.put(
  "/update_hours/:restaurantId",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  OpeningHoursController.updateOpeningHours,
);

router.get(
  "/timeslots/:restaurantId",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  OpeningHoursController.generateTimeSlots,
);

module.exports = router;
