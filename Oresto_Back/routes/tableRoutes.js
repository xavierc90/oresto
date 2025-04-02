const express = require("express");
const router = express.Router();
const passport = require("passport");
const TableController = require("../controllers/TableController");
const DatabaseMiddleware = require("../middlewares/database");

// Routes pour la gestion des tables
router.post(
  "/add_table",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.addOneTable,
);

router.post(
  "/add_tables",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.addManyTables,
);

router.get(
  "/find_table/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.findOneTableById,
);

router.get(
  "/tables_by_filters",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.findManyTables,
);

router.get(
  "/find_tables",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.findManyTablesById,
);

router.put(
  "/update_table/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.updateOneTable,
);

router.put(
  "/update_tables",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.updateManyTables,
);

router.put(
  "/archive_table/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.archiveOneTable,
);

router.delete(
  "/delete_table/:id",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.deleteOneTable,
);

router.delete(
  "/delete_tables",
  DatabaseMiddleware.checkConnection,
  passport.authenticate("jwt", { session: false }),
  TableController.deleteManyTables,
);

module.exports = router;
