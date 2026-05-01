const User = require("../models/User");
const Medicine = require("../models/Medicine");
const DoseLog = require("../models/DoseLog");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const totalMedicines = await Medicine.countDocuments({ user: userId });

    const totalLogs = await DoseLog.countDocuments({ user: userId });
    const takenLogs = await DoseLog.countDocuments({
      user: userId,
      status: "taken",
    });

    const adherence =
      totalLogs === 0 ? 0 : Math.round((takenLogs / totalLogs) * 100);

    const daysActive = user.createdAt
      ? Math.max(
          1,
          Math.ceil(
            (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
          )
        )
      : 0;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        personalInformation: {
          phone: user.personalInformation?.phone || "",
          dateOfBirth: user.personalInformation?.dateOfBirth || "",
          gender: user.personalInformation?.gender || "",
          emergencyContact: user.personalInformation?.emergencyContact || "",
        },
        medicalHistory: {
          bloodGroup: user.medicalHistory?.bloodGroup || "",
          allergies: user.medicalHistory?.allergies || "",
          chronicConditions: user.medicalHistory?.chronicConditions || "",
          pastSurgeries: user.medicalHistory?.pastSurgeries || "",
          currentDiseases: user.medicalHistory?.currentDiseases || "",
        },
      },
      stats: {
        medicines: totalMedicines,
        adherence,
        daysActive,
      },
      settings: {
        notifications: {
          pushEnabled: user.notifications?.pushEnabled ?? true,
          voiceEnabled: user.notifications?.voiceEnabled ?? false,
          soundEnabled: user.notifications?.soundEnabled ?? true,
          vibrationEnabled: user.notifications?.vibrationEnabled ?? true,
        },
        reminderLeadTime: user.reminderLeadTime ?? 10,
        language: user.language ?? "en",
        theme: user.theme ?? "light",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, personalInformation, medicalHistory } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (personalInformation) {
      user.personalInformation = {
        ...user.personalInformation?.toObject?.(),
        ...user.personalInformation,
        ...personalInformation,
      };
    }
    if (medicalHistory) {
      user.medicalHistory = {
        ...user.medicalHistory?.toObject?.(),
        ...user.medicalHistory,
        ...medicalHistory,
      };
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        personalInformation: {
          phone: user.personalInformation?.phone || "",
          dateOfBirth: user.personalInformation?.dateOfBirth || "",
          gender: user.personalInformation?.gender || "",
          emergencyContact: user.personalInformation?.emergencyContact || "",
        },
        medicalHistory: {
          bloodGroup: user.medicalHistory?.bloodGroup || "",
          allergies: user.medicalHistory?.allergies || "",
          chronicConditions: user.medicalHistory?.chronicConditions || "",
          pastSurgeries: user.medicalHistory?.pastSurgeries || "",
          currentDiseases: user.medicalHistory?.currentDiseases || "",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications, reminderLeadTime, language, theme } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (notifications) {
      user.notifications = {
        ...user.notifications?.toObject?.(),
        ...user.notifications,
        ...notifications,
      };
    }

    if (reminderLeadTime !== undefined) {
      user.reminderLeadTime = Number(reminderLeadTime);
    }

    if (language !== undefined) {
      user.language = language;
    }

    if (theme !== undefined) {
      user.theme = theme;
    }

    await user.save();

    res.json({
      message: "Settings updated successfully",
      settings: {
        notifications: user.notifications,
        reminderLeadTime: user.reminderLeadTime,
        language: user.language,
        theme: user.theme,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
};
