const express = require("express");
const router = express.Router();

const {
  getNotifications,
  clearAllNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.delete("/clear-all", protect, clearAllNotifications);

module.exports = router;
