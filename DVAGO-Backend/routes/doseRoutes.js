const express = require("express");
const router = express.Router();

const { markDoseTaken, markDoseMissed } = require("../controllers/doseController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:id/taken", protect, markDoseTaken);
router.post("/:id/missed", protect, markDoseMissed);

module.exports = router;
