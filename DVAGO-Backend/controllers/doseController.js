const DoseLog = require("../models/DoseLog");

const updateDoseStatus = async (req, res, status) => {
  try {
    const updates =
      status === "taken"
        ? { status, takenAt: new Date() }
        : { status, takenAt: null };

    const dose = await DoseLog.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      updates,
      { new: true }
    ).populate("medicine");

    if (!dose) {
      return res.status(404).json({ message: "Dose not found" });
    }

    res.json({
      message: `Dose marked as ${status}`,
      dose,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markDoseTaken = (req, res) => updateDoseStatus(req, res, "taken");

const markDoseMissed = (req, res) => updateDoseStatus(req, res, "missed");

module.exports = {
  markDoseTaken,
  markDoseMissed,
};
