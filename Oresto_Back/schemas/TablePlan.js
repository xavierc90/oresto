const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment-timezone");

const TablePlanSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    tables: [
      {
        table_id: {
          type: ObjectId,
          ref: "Table",
          required: true,
        },
        status: {
          type: String,
          enum: ["available", "occupied", "reserved"],
          default: "available",
        },
        reservations: [
          {
            reservation_id: {
              type: ObjectId,
              ref: "Reservation",
            },
            start_time: Date,
            end_time: Date,
          },
        ],
        number: String,
        capacity: {
          type: Number,
          required: true,
          min: 1,
        },
        shape: {
          type: String,
          enum: ["rectangle", "square", "round"],
          required: true,
        },
        position_x: {
          type: Number,
          default: 470,
        },
        position_y: {
          type: Number,
          default: 150,
        },
        rotate: {
          type: Number,
          min: 0,
          max: 360,
        },
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Pre-save hook pour forcer le format de la date à 00:00:00 dans le fuseau horaire Europe/Paris
TablePlanSchema.pre("save", function (next) {
  this.date = moment(this.date).tz("Europe/Paris").startOf("day").toDate();
  next();
});

// Ajout d'un index pour améliorer les performances de recherche
TablePlanSchema.index({ date: 1, restaurant_id: 1 });

module.exports = mongoose.model("TablePlan", TablePlanSchema);
