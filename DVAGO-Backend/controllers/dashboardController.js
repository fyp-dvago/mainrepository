const Medicine = require("../models/Medicine");
const Reminder = require("../models/Reminder");
const DoseLog = require("../models/DoseLog");

const getDashboard = async (req, res) => {
  try {

    const userId = req.user.id;

    // total medicines
    const totalMedicines = await Medicine.countDocuments({ user: userId });

    // today's logs
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const todayLogs = await DoseLog.find({
      user: userId,
      scheduledAt: { $gte: todayStart, $lte: todayEnd }
    }).populate("medicine");

    const takenToday = todayLogs.filter(log => log.status === "taken").length;

    const adherence =
      todayLogs.length === 0
        ? 0
        : Math.round((takenToday / todayLogs.length) * 100);

    // next upcoming dose
    const nextDose = await DoseLog.findOne({
      user: userId,
      status: "pending",
      scheduledAt: { $gte: new Date() }
    })
    .sort({ scheduledAt: 1 })
    .populate("medicine");

    res.json({
      stats: {
        medicines: totalMedicines,
        adherence,
        today: todayLogs.length
      },

      nextDose,

      todaySchedule: todayLogs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard
};
