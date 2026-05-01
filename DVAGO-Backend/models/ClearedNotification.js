const mongoose = require("mongoose");

const clearedNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["dose"],
      default: "dose",
    },
  },
  { timestamps: true }
);

clearedNotificationSchema.index(
  { user: 1, sourceId: 1, sourceType: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ClearedNotification",
  clearedNotificationSchema
);
