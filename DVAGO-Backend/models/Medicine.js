const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      enum: ["once", "twice", "thrice", "four"],
      default: "once",
    },

    duration: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },

    times: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#74BA1E",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
