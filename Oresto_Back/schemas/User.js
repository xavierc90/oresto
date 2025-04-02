const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    token: {
      type: String,
      required: false,
    },
    restaurant_id: {
      type: String,
      required: false,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    allergens: {
      type: [String],
      required: false,
      enum: [
        "Arachides",
        "Noix",
        "Lait",
        "Œufs",
        "Poisson",
        "Crustacés",
        "Blé",
        "Soja",
        "Sésame",
        "Gluten",
        "Moutarde",
        "Céleri",
        "Sulfites",
        "Lupin",
        "Mollusques",
      ],
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

UserSchema.virtual("restaurant", {
  ref: "Restaurant",
  localField: "_id",
  foreignField: "user_id",
});

module.exports = mongoose.model("User", UserSchema);
