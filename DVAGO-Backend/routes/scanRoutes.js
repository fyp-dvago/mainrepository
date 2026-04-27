const express = require("express");
const multer = require("multer");
const path = require("path");

const { protect } = require("../middleware/authMiddleware");
const { scanMedicine } = require("../controllers/scanController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/medicine", protect, upload.single("image"), scanMedicine);

module.exports = router;
