const DoseLog = require("../models/DoseLog");
const ClearedNotification = require("../models/ClearedNotification");

const getMedicineText = (dose) => {
  const medicine = dose?.medicine || {};
  return `${medicine.name || "Medicine"} ${medicine.dosage || ""}`.trim();
};

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Time unavailable";

const buildNotification = (dose) => {
  const medicineText = getMedicineText(dose);
  const time = formatTime(dose.scheduledAt);

  if (dose.status === "taken") {
    return {
      id: dose._id,
      sourceId: dose._id,
      title: "Dose Taken",
      message: `${medicineText} was marked as taken.`,
      type: "taken",
      time,
    };
  }

  if (dose.status === "missed") {
    return {
      id: dose._id,
      sourceId: dose._id,
      title: "Missed Dose",
      message: `${medicineText} was missed.`,
      type: "missed",
      time,
    };
  }

  return {
    id: dose._id,
    sourceId: dose._id,
    title: "Dosage Reminder",
    message: `${medicineText} is scheduled for ${time}.`,
    type: "reminder",
    time,
  };
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const doses = await DoseLog.find({
      user: userId,
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
    })
      .sort({ scheduledAt: 1 })
      .populate("medicine");

    const cleared = await ClearedNotification.find({
      user: userId,
      sourceType: "dose",
      sourceId: { $in: doses.map((dose) => String(dose._id)) },
    });
    const clearedIds = new Set(cleared.map((item) => item.sourceId));

    res.json({
      notifications: doses
        .filter((dose) => !clearedIds.has(String(dose._id)))
        .map(buildNotification),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const doses = await DoseLog.find({
      user: userId,
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
    }).select("_id");

    if (doses.length > 0) {
      await ClearedNotification.bulkWrite(
        doses.map((dose) => ({
          updateOne: {
            filter: {
              user: userId,
              sourceType: "dose",
              sourceId: String(dose._id),
            },
            update: {
              $setOnInsert: {
                user: userId,
                sourceType: "dose",
                sourceId: String(dose._id),
              },
            },
            upsert: true,
          },
        }))
      );
    }

    res.json({
      message: "Notifications cleared",
      clearedCount: doses.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  clearAllNotifications,
};
