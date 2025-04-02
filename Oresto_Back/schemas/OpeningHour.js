const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const OpeningHourSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: ObjectId,
      ref: "Restaurant",
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    slots: [
      {
        start_time: {
          type: String,
          required: true,
        },
        end_time: {
          type: String,
          required: true,
        },
      },
    ],
    is_closed: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Index unique sur restaurant_id et day
OpeningHourSchema.index({ restaurant_id: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("OpeningHour", OpeningHourSchema);
