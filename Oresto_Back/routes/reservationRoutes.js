const express = require("express");
const router = express.Router();
const passport = require("passport");
const ReservationController = require("../controllers/ReservationController");
const DatabaseMiddleware = require("../middlewares/database");
const validateRestaurant = require("../middlewares/validateRestaurant");

// Routes pour la gestion des réservations
router.post(
  "/add_reservation",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  validateRestaurant,
  ReservationController.addOneReservation,
);

router.post(
  "/confirm_reservation/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  ReservationController.confirmReservation,
);

router.post(
  "/cancel_reservation/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  ReservationController.cancelReservation,
);

router.post(
  "/archive_reservation/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  ReservationController.archiveReservation,
);

router.get(
  "/reservations/:date",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  ReservationController.findReservationsByDate,
);

router.get(
  "/reservations/user/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  ReservationController.findReservationsByUserId,
);

router.get(
  "/reservations",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  ReservationController.findAllReservations,
);

module.exports = router;
