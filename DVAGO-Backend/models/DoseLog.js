const mongoose = require("mongoose");

const doseLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    takenAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "taken", "missed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoseLog", doseLogSchema);
