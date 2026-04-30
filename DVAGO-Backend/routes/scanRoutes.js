const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { scanMedicine } = require("../controllers/scanController");

const router = express.Router();

router.post("/medicine", protect, upload.single("image"), scanMedicine);

module.exports = router;
