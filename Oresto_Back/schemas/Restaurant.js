const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const RestaurantSchema = new mongoose.Schema(
  {
    user_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    reservation_id: {
      type: ObjectId,
      ref: "Reservation",
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    postal_code: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    phone_number: {
      type: Number,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: ["opened", "closed"],
      default: "opened",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    authorized_domains: {
      type: [String],
      default: [],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

RestaurantSchema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
