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
    },

    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
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

    personalInformation: {
      phone: {
        type: String,
        trim: true,
        default: "",
      },
      dateOfBirth: {
        type: String,
        trim: true,
        default: "",
      },
      gender: {
        type: String,
        trim: true,
        default: "",
      },
      emergencyContact: {
        type: String,
        trim: true,
        default: "",
      },
    },

    medicalHistory: {
      bloodGroup: {
        type: String,
        trim: true,
        default: "",
      },
      allergies: {
        type: String,
        trim: true,
        default: "",
      },
      chronicConditions: {
        type: String,
        trim: true,
        default: "",
      },
      pastSurgeries: {
        type: String,
        trim: true,
        default: "",
      },
      currentDiseases: {
        type: String,
        trim: true,
        default: "",
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
