const mongoose = require("mongoose");
const moment = require("moment-timezone");
const ObjectId = mongoose.Types.ObjectId;

const ReservationSchema = new mongoose.Schema(
  {
    date_selected: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return moment(value)
            .startOf("day")
            .isSameOrAfter(moment().startOf("day"));
        },
        message: (props) => `The reservation date cannot be in the past.`,
      },
    },
    time_selected: {
      type: String,
      required: true,
    },
    nbr_persons: {
      type: Number,
      required: true,
      min: [1, "The number of persons must be at least 1."],
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["waiting", "confirmed", "canceled", "archived"],
      default: "waiting",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    restaurant_id: {
      type: ObjectId,
      ref: "Restaurant",
      required: true,
    },
    table_id: {
      type: ObjectId,
      ref: "Table",
      required: true,
    },
    table_number: {
      type: String,
    },
    user_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Virtual pour récupérer les informations de l'utilisateur
ReservationSchema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

// Virtual pour récupérer les informations de la table
ReservationSchema.virtual("table", {
  ref: "Table",
  localField: "table_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Reservation", ReservationSchema);
