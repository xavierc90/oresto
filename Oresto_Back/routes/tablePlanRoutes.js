const express = require("express");
const router = express.Router();
const passport = require("passport");
const TablePlanController = require("../controllers/TablePlanController");
const DatabaseMiddleware = require("../middlewares/database");

// Routes pour la gestion des plans de table
router.post(
  "/table_plan/today",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TablePlanController.updateOrAddOneTablePlan,
);

router.get(
  "/table_plan/:date",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TablePlanController.findOneTablePlan,
);

router.get(
  "/table_plans",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TablePlanController.findManyTablePlans,
);

module.exports = router;
