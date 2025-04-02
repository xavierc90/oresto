const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const restaurantRoutes = require("./restaurantRoutes");
const tableRoutes = require("./tableRoutes");
const reservationRoutes = require("./reservationRoutes");
const openingHoursRoutes = require("./openingHoursRoutes");
const tablePlanRoutes = require("./tablePlanRoutes");

// Montage des routes
router.use("/", userRoutes);
router.use("/", restaurantRoutes);
router.use("/", tableRoutes);
router.use("/", reservationRoutes);
router.use("/", openingHoursRoutes);
router.use("/", tablePlanRoutes);

module.exports = router;
