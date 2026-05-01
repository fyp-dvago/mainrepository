const DoseLog = require("../models/DoseLog");
const Medicine = require("../models/Medicine");

const updateDoseStatus = async (req, res, status) => {
  try {
    let stockShouldDecrease = false;
    let dose;

    if (status === "taken") {
      dose = await DoseLog.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
          status: { $ne: "taken" },
        },
        {
          status,
          takenAt: new Date(),
        },
        { returnDocument: "after" }
      );

      stockShouldDecrease = !!dose;

      if (!dose) {
        dose = await DoseLog.findOne({
          _id: req.params.id,
          user: req.user.id,
        });
      }
    } else {
      dose = await DoseLog.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        {
          status,
          takenAt: null,
        },
        { returnDocument: "after" }
      );
    }

    if (!dose) {
      return res.status(404).json({ message: "Dose not found" });
    }

    if (stockShouldDecrease) {
      await Medicine.updateOne(
        {
          _id: dose.medicine,
          user: req.user.id,
          stock: { $gt: 0 },
        },
        {
          $inc: { stock: -1 },
        }
      );
    }

    await dose.populate("medicine");

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
