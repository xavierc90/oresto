const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment-timezone");

const TableSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: ObjectId,
      ref: "Restaurant",
      required: true,
    },
    created_by: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "La capacité doit être d'au moins 1 personne."],
    },
    shape: {
      type: String,
      required: true,
      enum: ["rectangle", "square", "round"],
    },
    status: {
      type: String,
      enum: ["available", "archived"],
      default: "available",
    },
    index: {
      type: Number,
      default: 0,
    },
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    rotate: {
      type: Number,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Ajout d'un index partiel sur le champ 'number' pour garantir l'unicité seulement si la table n'est pas en statut 'archived'
TableSchema.index(
  { number: 1, restaurant_id: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "archived" } } },
);

module.exports = mongoose.model("Table", TableSchema);
