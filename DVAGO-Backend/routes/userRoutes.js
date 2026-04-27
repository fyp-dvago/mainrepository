const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateSettings,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/settings", protect, updateSettings);

module.exports = router;
