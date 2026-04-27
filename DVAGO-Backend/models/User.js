const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    notifications: {
      pushEnabled: {
        type: Boolean,
        default: true,
      },
      voiceEnabled: {
        type: Boolean,
        default: false,
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
      vibrationEnabled: {
        type: Boolean,
        default: true,
      },
    },

    reminderLeadTime: {
      type: Number,
      default: 10,
    },

    language: {
      type: String,
      enum: ["en", "ms"],
      default: "en",
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
