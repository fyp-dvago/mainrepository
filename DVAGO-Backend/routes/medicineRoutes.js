const express = require("express");
const router = express.Router();

const {
  addMedicine,
  getMedicines,
  getMedicineById,
  getMedicineDetails,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addMedicine);
router.get("/", protect, getMedicines);
router.get("/:id/details", protect, getMedicineDetails);
router.get("/:id", protect, getMedicineById);
router.put("/:id", protect, updateMedicine);
router.delete("/:id", protect, deleteMedicine);

module.exports = router;
