const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment-timezone");

const TableReservationSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    restaurant_id: {
      type: ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tables: [
      {
        table_id: {
          type: ObjectId,
          ref: "Table",
          required: true,
        },
        reservations: [
          {
            reservation_id: {
              type: ObjectId,
              ref: "Reservation",
            },
            status: {
              type: String,
              enum: ["waiting", "confirmed", "canceled", "archived"],
            },
            occupied_start: {
              type: Date,
            },
            occupied_end: {
              type: Date,
            },
          },
        ], // Un tableau d'objets Reservation
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Pre-save hook pour forcer le format de la date à 00:00:00 dans le fuseau horaire Europe/Paris
TableReservationSchema.pre("save", function (next) {
  console.log("=== Pre-save hook ===");
  console.log("Date avant conversion:", this.date);

  // Convertir la date à minuit UTC
  this.date = moment(this.date).utc().startOf("day").toDate();
  console.log("Date après conversion à minuit UTC:", this.date);

  next();
});

module.exports = mongoose.model("TableReservation", TableReservationSchema);
