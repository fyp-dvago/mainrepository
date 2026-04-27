const Medicine = require("../models/Medicine");
const Reminder = require("../models/Reminder");
const DoseLog = require("../models/DoseLog");

const addMedicine = async (req, res) => {
  try {
    const {
      name,
      dosage,
      frequency,
      duration,
      stock,
      instructions,
      times,
      category,
      color,
    } = req.body;

    if (!name || !dosage || stock === undefined || stock === null) {
      return res.status(400).json({
        message: "Name, dosage, and stock are required",
      });
    }

    const parsedDuration = duration ? Number(duration) : 0;
    const parsedStock = Number(stock);
    const validTimes = Array.isArray(times) ? times : [];

    const medicine = await Medicine.create({
      user: req.user.id,
      name,
      dosage,
      frequency: frequency || "once",
      duration: parsedDuration,
      stock: parsedStock,
      instructions: instructions || "",
      times: validTimes,
      category: category || "",
      color: color || "#74BA1E",
    });

    let createdReminders = [];

    if (validTimes.length > 0) {
      const startDate = new Date();
      const endDate =
        parsedDuration > 0
          ? new Date(Date.now() + parsedDuration * 24 * 60 * 60 * 1000)
          : null;

      const reminderDocs = validTimes.map((time) => ({
        user: req.user.id,
        medicine: medicine._id,
        time,
        frequencyType: "daily",
        startDate,
        endDate,
        isActive: true,
      }));

      createdReminders = await Reminder.insertMany(reminderDocs);

      // Create dose logs for each day and each time
      if (parsedDuration > 0) {
        const doseLogs = [];

        for (let day = 0; day < parsedDuration; day++) {
          for (let i = 0; i < validTimes.length; i++) {
            const time = validTimes[i];
            const reminder = createdReminders[i];

            const [hours, minutes] = time.split(":").map(Number);

            if (
              Number.isNaN(hours) ||
              Number.isNaN(minutes) ||
              hours < 0 ||
              hours > 23 ||
              minutes < 0 ||
              minutes > 59
            ) {
              continue;
            }

            const scheduledAt = new Date();
            scheduledAt.setHours(0, 0, 0, 0);
            scheduledAt.setDate(scheduledAt.getDate() + day);
            scheduledAt.setHours(hours, minutes, 0, 0);

            doseLogs.push({
              user: req.user.id,
              medicine: medicine._id,
              reminder: reminder?._id,
              scheduledAt,
              status: scheduledAt < new Date() ? "missed" : "pending",
            });
          }
        }

        if (doseLogs.length > 0) {
          await DoseLog.insertMany(doseLogs);
        }
      }
    }

    res.status(201).json({
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(medicines);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMedicineDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const medicineId = req.params.id;

    const medicine = await Medicine.findOne({
      _id: medicineId,
      user: userId,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    const now = new Date();

    const upcomingSchedule = await DoseLog.find({
      user: userId,
      medicine: medicineId,
      scheduledAt: { $gte: now },
    })
      .sort({ scheduledAt: 1 })
      .limit(10);

    const history = await DoseLog.find({
      user: userId,
      medicine: medicineId,
      scheduledAt: { $lt: now },
    })
      .sort({ scheduledAt: -1 })
      .limit(20);

    const nextDoseLog = upcomingSchedule.length > 0 ? upcomingSchedule[0] : null;

    const formattedUpcoming = upcomingSchedule.map((item) => {
      let status = item.status;

      if (item.status === "pending") {
        const diff = new Date(item.scheduledAt) - new Date();
        if (diff > 0) status = "upcoming";
      }

      return {
        id: item._id,
        time: new Date(item.scheduledAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(item.scheduledAt).toDateString(),
        status,
      };
    });

    const formattedHistory = history.map((item) => {
      const onTime =
        item.status === "taken" && item.takenAt
          ? Math.abs(new Date(item.takenAt) - new Date(item.scheduledAt)) <=
            30 * 60 * 1000
          : false;

      return {
        id: item._id,
        date: new Date(item.scheduledAt).toDateString(),
        time: new Date(item.scheduledAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: item.status,
        onTime,
      };
    });

    res.json({
      medicine: {
        _id: medicine._id,
        name: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        stock: medicine.stock,
        category: medicine.category,
        color: medicine.color,
        instructions: medicine.instructions,
        nextDose: nextDoseLog
          ? new Date(nextDoseLog.scheduledAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      },
      schedule: formattedUpcoming,
      history: formattedHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    const fields = [
      "name",
      "dosage",
      "frequency",
      "duration",
      "stock",
      "instructions",
      "times",
      "category",
      "color",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        medicine[field] = req.body[field];
      }
    });

    await medicine.save();

    res.json({
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    await Reminder.deleteMany({ medicine: req.params.id, user: req.user.id });
    await DoseLog.deleteMany({ medicine: req.params.id, user: req.user.id });

    res.json({
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addMedicine,
  getMedicines,
  getMedicineById,
  getMedicineDetails,
  updateMedicine,
  deleteMedicine,
};
